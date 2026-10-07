import type { ISandbox } from "@aether/sandbox";
import type { LLMTool } from "@aether/gateway";

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  output: any;
  error?: string;
}

export type ToolHandler = (args: any) => Promise<any>;

export interface RegisteredTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: ToolHandler;
}

export class MCPManager {
  private tools: Map<string, RegisteredTool> = new Map();

  registerTool(tool: RegisteredTool): void {
    this.tools.set(tool.name, tool);
  }

  getLLMTools(): LLMTool[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }

  async executeTool(name: string, args: Record<string, any>): Promise<ToolExecutionResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        toolName: name,
        success: false,
        output: null,
        error: `Tool '${name}' is not registered in MCPManager.`
      };
    }

    try {
      const output = await tool.handler(args);
      return {
        toolName: name,
        success: true,
        output
      };
    } catch (err: any) {
      return {
        toolName: name,
        success: false,
        output: null,
        error: err.message || String(err)
      };
    }
  }

  /**
   * Registers default sovereign filesystem & shell tools bound to a sandboxed jail.
   */
  registerDefaultSandboxTools(sandbox: ISandbox): void {
    this.registerTool({
      name: "read_file",
      description: "Read the full text contents of a file within the workspace jail.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to the file" }
        },
        required: ["path"]
      },
      handler: async (args: { path: string }) => {
        return await sandbox.readFile(args.path);
      }
    });

    this.registerTool({
      name: "write_file",
      description: "Write or overwrite content to a file within the workspace jail.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to target file" },
          content: { type: "string", description: "File content to write" }
        },
        required: ["path", "content"]
      },
      handler: async (args: { path: string; content: string }) => {
        await sandbox.writeFile(args.path, args.content);
        return { status: "written", path: args.path };
      }
    });

    this.registerTool({
      name: "delete_file",
      description: "Delete a file within the workspace jail.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Relative path to target file" }
        },
        required: ["path"]
      },
      handler: async (args: { path: string }) => {
        await sandbox.deleteFile(args.path);
        return { status: "deleted", path: args.path };
      }
    });

    this.registerTool({
      name: "execute_command",
      description: "Execute a shell command within the jailed workspace boundary.",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Command line string" },
          timeoutMs: { type: "number", description: "Optional execution timeout in milliseconds" }
        },
        required: ["command"]
      },
      handler: async (args: { command: string; timeoutMs?: number }) => {
        const res = await sandbox.executeCommand(args.command, ".", args.timeoutMs || 30000);
        return res;
      }
    });
  }
}
