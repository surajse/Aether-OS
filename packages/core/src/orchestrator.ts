import type { TaskContract } from "@aether/types";
import { AgentRuntime } from "./runtime.js";
import { ActionReviewInterceptor } from "./interceptor.js";
import { CognitiveGovernor } from "./governor.js";
import type { ISandbox } from "@aether/sandbox";
import { ActionClassifier } from "@aether/sandbox";
import type { ModelGateway } from "@aether/gateway";
import type { MCPManager } from "@aether/protocol";

export interface OrchestrationResult {
  taskId: string;
  success: boolean;
  stepsExecuted: number;
  selfHealingAttempts: number;
  verificationPassed: boolean;
  message: string;
}

export class AutonomousOrchestrator {
  private runtime: AgentRuntime;
  private interceptor: ActionReviewInterceptor;
  private governor: CognitiveGovernor;
  private classifier: ActionClassifier;

  constructor(
    private sandbox: ISandbox,
    private mcp: MCPManager,
    private gateway: ModelGateway,
    runtime?: AgentRuntime
  ) {
    this.runtime = runtime || new AgentRuntime();
    this.interceptor = new ActionReviewInterceptor(this.runtime);
    this.governor = new CognitiveGovernor();
    this.classifier = new ActionClassifier();
  }

  getRuntime(): AgentRuntime {
    return this.runtime;
  }

  getInterceptor(): ActionReviewInterceptor {
    return this.interceptor;
  }

  /**
   * Executes the full autonomous goal loop with deterministic self-healing.
   */
  async executeGoal(
    task: TaskContract,
    verificationTestCommand: string,
    maxHealingAttempts = 3
  ): Promise<OrchestrationResult> {
    await this.runtime.startTask(task);

    await this.runtime.emitEvent({
      type: "THOUGHT_CHUNK",
      chunk: `Starting autonomous execution of task: "${task.goal}"`,
      timestamp: Date.now()
    });

    // 1. Initial Plan Phase
    const planningResponse = await this.gateway.generate([
      {
        role: "system",
        content: "You are the AetherOS Lead Agent. Formulate an execution strategy."
      },
      { role: "user", content: `Goal: ${task.goal}` }
    ]);

    await this.runtime.emitEvent({
      type: "THOUGHT_CHUNK",
      chunk: planningResponse.content || "Plan formulated. Beginning step execution.",
      timestamp: Date.now()
    });

    await this.runtime.transitionTo("EXECUTING");

    let stepsExecuted = 0;
    let healingAttempts = 0;

    // 2. Pre-Verification Run
    let testResult = await this.sandbox.executeCommand(verificationTestCommand);

    // 3. Self-Healing Loop if tests fail
    while (testResult.exitCode !== 0 && healingAttempts < maxHealingAttempts) {
      healingAttempts++;
      stepsExecuted++;

      await this.runtime.emitEvent({
        type: "THOUGHT_CHUNK",
        chunk: `[Self-Healing Strike ${healingAttempts}/${maxHealingAttempts}] Verification failed. Inspecting stderr and formulating repair...`,
        timestamp: Date.now()
      });

      // Prompt gateway for a repair tool call
      const repairPrompt = [
        {
          role: "system" as const,
          content: "Fix the failing test. Call the write_file or execute_command tool to resolve the issue."
        },
        {
          role: "user" as const,
          content: `Test failed with stderr:\n${testResult.stderr}\nStdout:\n${testResult.stdout}`
        }
      ];

      const repairResponse = await this.gateway.generate(repairPrompt, this.mcp.getLLMTools());

      if (repairResponse.toolCalls && repairResponse.toolCalls.length > 0) {
        for (const call of repairResponse.toolCalls) {
          // Classify risk accurately based on tool semantics
          let classified;
          if (call.name === "execute_command") {
            classified = this.classifier.classifyCommand(call.arguments.command || "");
          } else if (call.name === "write_file") {
            classified = this.classifier.classifyFileModification(call.arguments.path || "workspace", false);
          } else if (call.name === "read_file" || call.name === "list_files") {
            classified = { riskLevel: "LOW" as const, isIrreversible: false, reasons: ["Read-only tool call."] };
          } else {
            classified = this.classifier.classifyCommand(call.name);
          }

          // Action Review Gate
          const review = await this.interceptor.interceptAction(
            task.id,
            call.name,
            classified.riskLevel,
            `Self-healing action: ${call.name}`,
            { filesChanged: [call.arguments.path || "workspace"], command: call.arguments.command }
          );

          if (!review.approved) {
            return {
              taskId: task.id,
              success: false,
              stepsExecuted,
              selfHealingAttempts: healingAttempts,
              verificationPassed: false,
              message: "Execution halted: Human rejected self-healing action."
            };
          }

          // Execute tool
          await this.runtime.emitEvent({
            type: "TOOL_INVOCATION",
            tool: call.name,
            args: call.arguments,
            timestamp: Date.now()
          });

          const toolRes = await this.mcp.executeTool(call.name, call.arguments);

          await this.runtime.emitEvent({
            type: "TOOL_RESULT",
            tool: call.name,
            output: toolRes.output,
            exitCode: toolRes.success ? 0 : 1,
            timestamp: Date.now()
          });
        }
      }

      // Re-run test
      testResult = await this.sandbox.executeCommand(verificationTestCommand);
    }

    // 4. Final Verification
    if (testResult.exitCode === 0) {
      this.runtime.registerVerificationReceipt({
        testSuite: verificationTestCommand,
        passed: true,
        timestamp: Date.now()
      });

      await this.runtime.transitionTo("COMPLETED");

      await this.runtime.emitEvent({
        type: "THOUGHT_CHUNK",
        chunk: "Goal achieved with 100% verified test pass. Transitioned to COMPLETED.",
        timestamp: Date.now()
      });

      return {
        taskId: task.id,
        success: true,
        stepsExecuted,
        selfHealingAttempts: healingAttempts,
        verificationPassed: true,
        message: "Task completed successfully with green verification tests."
      };
    } else {
      await this.runtime.transitionTo("FAILED");
      return {
        taskId: task.id,
        success: false,
        stepsExecuted,
        selfHealingAttempts: healingAttempts,
        verificationPassed: false,
        message: `Task failed: Test did not pass after ${maxHealingAttempts} self-healing attempts.`
      };
    }
  }
}
