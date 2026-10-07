import * as http from "node:http";
import type { AGUIEvent } from "@aether/types";
import { AGUIEventFormatter } from "./events.js";

export type ActionHandler = (agentId: string, action: {
  actionId?: string;
  approved?: boolean;
  feedback?: string;
  command?: string;
}) => Promise<{ success: boolean; message?: string }>;

export type GoalHandler = (agentId: string, payload: {
  goal: string;
  testCommand?: string;
}) => Promise<any>;

export type SkillProvider = () => any[];

export class AGUIServer {
  private server: http.Server;
  private clientStreams: Map<string, Set<http.ServerResponse>> = new Map();
  private actionHandler: ActionHandler | null = null;
  private goalHandler: GoalHandler | null = null;
  private skillProvider: SkillProvider | null = null;

  constructor() {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  setActionHandler(handler: ActionHandler): void {
    this.actionHandler = handler;
  }

  setGoalHandler(handler: GoalHandler): void {
    this.goalHandler = handler;
  }

  setSkillProvider(provider: SkillProvider): void {
    this.skillProvider = provider;
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    // Enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "healthy", timestamp: Date.now() }));
      return;
    }

    // Match GET /api/skills
    if (url.pathname === "/api/skills" && req.method === "GET") {
      const skills = this.skillProvider ? this.skillProvider() : [];
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ skills, count: skills.length }));
      return;
    }

    // Match GET /api/agents/:id/stream
    const streamMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/stream$/);
    if (streamMatch && req.method === "GET") {
      const agentId = streamMatch[1];
      this.handleSSEConnection(agentId, res);
      return;
    }

    // Match POST /api/agents/:id/action
    const actionMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/action$/);
    if (actionMatch && req.method === "POST") {
      const agentId = actionMatch[1];
      this.handleActionPost(agentId, req, res);
      return;
    }

    // Match POST /api/agents/:id/goal
    const goalMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/goal$/);
    if (goalMatch && req.method === "POST") {
      const agentId = goalMatch[1];
      this.handleGoalPost(agentId, req, res);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }

  private handleGoalPost(agentId: string, req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        if (!payload.goal) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing required 'goal' parameter in payload." }));
          return;
        }

        if (this.goalHandler) {
          const result = await this.goalHandler(agentId, payload);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(503, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No goal handler attached to server." }));
        }
      } catch (err: any) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || "Failed to execute goal" }));
      }
    });
  }

  private handleSSEConnection(agentId: string, res: http.ServerResponse): void {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    });

    if (!this.clientStreams.has(agentId)) {
      this.clientStreams.set(agentId, new Set());
    }
    const streams = this.clientStreams.get(agentId)!;
    streams.add(res);

    // Initial greeting / connection ping
    res.write("event: connected\ndata: {}\n\n");

    res.on("close", () => {
      streams.delete(res);
      if (streams.size === 0) {
        this.clientStreams.delete(agentId);
      }
    });
  }

  private handleActionPost(agentId: string, req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        if (this.actionHandler) {
          const result = await this.actionHandler(agentId, payload);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, message: "Action received with no handler attached." }));
        }
      } catch (err: any) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message || "Invalid JSON payload" }));
      }
    });
  }

  broadcastEvent(agentId: string, event: AGUIEvent): void {
    const streams = this.clientStreams.get(agentId);
    if (!streams || streams.size === 0) return;

    const formatted = AGUIEventFormatter.formatEvent(event);
    const ssePayload = AGUIEventFormatter.serializeSSE(formatted);

    for (const res of streams) {
      res.write(ssePayload);
    }
  }

  listen(port: number): Promise<number> {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        const addr = this.server.address();
        const actualPort = typeof addr === "object" && addr ? addr.port : port;
        resolve(actualPort);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      for (const streamSet of this.clientStreams.values()) {
        for (const res of streamSet) {
          try {
            res.end();
          } catch {
            // ignore
          }
        }
      }
      this.clientStreams.clear();
      if (!this.server.listening) {
        resolve();
        return;
      }
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
