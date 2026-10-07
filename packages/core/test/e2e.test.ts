import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { LocalProcessJail } from "@aether/sandbox";
import { MCPManager } from "@aether/protocol";
import { ModelGateway, MockLLMProvider } from "@aether/gateway";
import { AutonomousOrchestrator } from "../src/orchestrator.js";
import type { TaskContract } from "@aether/types";

describe("AutonomousOrchestrator End-to-End Self-Healing Loop", () => {
  let tempDir: string;
  let sandbox: LocalProcessJail;
  let mcp: MCPManager;
  let mockProvider: MockLLMProvider;
  let gateway: ModelGateway;
  let orchestrator: AutonomousOrchestrator;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `aether-e2e-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    sandbox = new LocalProcessJail(tempDir);
    mcp = new MCPManager();
    mcp.registerDefaultSandboxTools(sandbox);

    mockProvider = new MockLLMProvider("TestProvider");
    gateway = new ModelGateway([mockProvider]);
    orchestrator = new AutonomousOrchestrator(sandbox, mcp, gateway);
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

  it("autonomously repairs failing code and reaches verified COMPLETED state", async () => {
    // 1. Create initially failing test script in sandbox
    const brokenScript = `
      // Broken implementation
      if (1 + 1 !== 3) {
        console.error('AssertionError: Expected 1+1 to equal 3');
        process.exit(1);
      }
    `;
    await sandbox.writeFile("test.js", brokenScript);

    // 2. Configure mock LLM to provide the correct fix tool call upon seeing failure
    const fixedScript = `
      // Repaired implementation
      if (1 + 1 !== 2) {
        console.error('AssertionError: Math is broken');
        process.exit(1);
      }
      console.log('All tests passed!');
      process.exit(0);
    `;

    mockProvider.mockResponse = {
      content: "Detected failing assertion. Applying fix to test.js",
      toolCalls: [
        {
          id: "call_repair",
          name: "write_file",
          arguments: {
            path: "test.js",
            content: fixedScript
          }
        }
      ]
    };

    const task: TaskContract = {
      id: "999e4567-e89b-12d3-a456-426614174999",
      goal: "Repair broken test.js assertions",
      invariants: ["Must pass node test.js with exit code 0"],
      maxBudgetUsd: 2,
      timeoutMs: 30000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // 3. Execute Goal with Self-Healing Loop
    const result = await orchestrator.executeGoal(task, "node test.js");

    // 4. Assert full autonomous success
    expect(result.success).toBe(true);
    expect(result.verificationPassed).toBe(true);
    expect(result.selfHealingAttempts).toBe(1);
    expect(orchestrator.getRuntime().getState()).toBe("COMPLETED");

    // 5. Verify the file on disk was indeed repaired
    const repairedContent = await sandbox.readFile("test.js");
    expect(repairedContent).toContain("All tests passed!");
  });
});
