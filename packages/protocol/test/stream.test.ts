import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as http from "node:http";
import { AGUIServer } from "../src/server.js";
import type { AGUIEvent } from "@aether/types";

describe("AGUIServer Server-Sent Events & Steering", () => {
  let server: AGUIServer;
  let port: number;

  beforeEach(async () => {
    server = new AGUIServer();
    // Port 0 picks any random available OS port
    port = await server.listen(0);
  });

  afterEach(async () => {
    await server.close();
  });

  it("responds to /health endpoint", async () => {
    const data = await new Promise<string>((resolve) => {
      http.get(`http://localhost:${port}/health`, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      });
    });

    const parsed = JSON.parse(data);
    expect(parsed.status).toBe("healthy");
  });

  it("streams AG-UI events over Server-Sent Events (SSE)", async () => {
    const receivedChunks: string[] = [];

    // Connect SSE client
    const req = http.get(`http://localhost:${port}/api/agents/test-agent-1/stream`, (res) => {
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toBe("text/event-stream");

      res.on("data", (chunk) => {
        receivedChunks.push(chunk.toString());
      });
    });

    // Wait 50ms for connection handshake
    await new Promise((r) => setTimeout(r, 50));

    // Broadcast a thought chunk event
    const thoughtEvent: AGUIEvent = {
      type: "THOUGHT_CHUNK",
      chunk: "Planning database indexing strategy...",
      timestamp: Date.now()
    };
    server.broadcastEvent("test-agent-1", thoughtEvent);

    // Wait 50ms for chunk arrival
    await new Promise((r) => setTimeout(r, 50));

    req.destroy();

    const fullPayload = receivedChunks.join("");
    expect(fullPayload).toContain("event: thought:chunk");
    expect(fullPayload).toContain("Planning database indexing strategy...");
  });

  it("handles incoming user action and steering posts", async () => {
    let capturedAction: any = null;
    server.setActionHandler(async (agentId, action) => {
      capturedAction = { agentId, action };
      return { success: true, message: "Action approved by human" };
    });

    const postPayload = JSON.stringify({
      actionId: "act_456",
      approved: true,
      feedback: "Proceed with caution"
    });

    const responseBody = await new Promise<string>((resolve) => {
      const postReq = http.request(
        `http://localhost:${port}/api/agents/test-agent-2/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postPayload)
          }
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => resolve(body));
        }
      );
      postReq.write(postPayload);
      postReq.end();
    });

    const parsedRes = JSON.parse(responseBody);
    expect(parsedRes.success).toBe(true);
    expect(capturedAction).not.toBeNull();
    expect(capturedAction.agentId).toBe("test-agent-2");
    expect(capturedAction.action.approved).toBe(true);
    expect(capturedAction.action.feedback).toBe("Proceed with caution");
  });
});
