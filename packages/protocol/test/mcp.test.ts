import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { LocalProcessJail } from "@aether/sandbox";
import { MCPManager } from "../src/mcp.js";

describe("MCPManager Tool Client", () => {
  let tempDir: string;
  let sandbox: LocalProcessJail;
  let mcp: MCPManager;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `aether-mcp-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    sandbox = new LocalProcessJail(tempDir);
    mcp = new MCPManager();
    mcp.registerDefaultSandboxTools(sandbox);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore on windows lock
      }
    }
  });

  it("exports registered tools formatted as LLMTool objects", () => {
    const llmTools = mcp.getLLMTools();
    expect(llmTools.length).toBe(4);
    const names = llmTools.map((t) => t.name);
    expect(names).toContain("read_file");
    expect(names).toContain("write_file");
    expect(names).toContain("delete_file");
    expect(names).toContain("execute_command");
  });

  it("executes write_file and read_file tools successfully", async () => {
    const writeRes = await mcp.executeTool("write_file", {
      path: "config.json",
      content: JSON.stringify({ aether: true })
    });
    expect(writeRes.success).toBe(true);

    const readRes = await mcp.executeTool("read_file", {
      path: "config.json"
    });
    expect(readRes.success).toBe(true);
    expect(readRes.output).toContain('"aether":true');
  });

  it("executes execute_command tool successfully within sandbox", async () => {
    const execRes = await mcp.executeTool("execute_command", {
      command: "node -e \"console.log('mcp execution verified')\""
    });
    expect(execRes.success).toBe(true);
    expect(execRes.output.exitCode).toBe(0);
    expect(execRes.output.stdout).toContain("mcp execution verified");
  });

  it("handles unregistered tool gracefully", async () => {
    const res = await mcp.executeTool("non_existent_tool", {});
    expect(res.success).toBe(false);
    expect(res.error).toContain("is not registered");
  });
});
