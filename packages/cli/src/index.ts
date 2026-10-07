import { LocalProcessJail } from "@aether/sandbox";
import { MCPManager, AGUIServer } from "@aether/protocol";
import { ModelGateway, MockLLMProvider } from "@aether/gateway";
import { AutonomousOrchestrator } from "@aether/core";
import { ConstitutionalAnchor, TemporalKnowledgeGraph } from "@aether/memory";
import { SkillSynthesizer } from "@aether/skills";
import type { TaskContract } from "@aether/types";

export interface AetherNodeConfig {
  workspaceDir: string;
  port?: number;
}

export class AetherNode {
  public sandbox: LocalProcessJail;
  public mcp: MCPManager;
  public gateway: ModelGateway;
  public server: AGUIServer;
  public orchestrator: AutonomousOrchestrator;
  public constitutionalAnchor: ConstitutionalAnchor;
  public knowledgeGraph: TemporalKnowledgeGraph;
  public skillSynthesizer: SkillSynthesizer;

  constructor(config: AetherNodeConfig) {
    this.sandbox = new LocalProcessJail(config.workspaceDir);
    this.mcp = new MCPManager();
    this.mcp.registerDefaultSandboxTools(this.sandbox);

    // Default mock provider (can be injected with Anthropic or OpenAI)
    const defaultProvider = new MockLLMProvider("AetherLocalDefault");
    this.gateway = new ModelGateway([defaultProvider]);

    this.server = new AGUIServer();
    this.orchestrator = new AutonomousOrchestrator(this.sandbox, this.mcp, this.gateway);
    this.constitutionalAnchor = new ConstitutionalAnchor();
    this.knowledgeGraph = new TemporalKnowledgeGraph();
    this.skillSynthesizer = new SkillSynthesizer(this.mcp);

    // Forward runtime events to AGUI SSE server
    this.orchestrator.getRuntime().subscribe((event) => {
      this.server.broadcastEvent("default-agent", event);
    });

    // Attach action handler for web UI steering
    this.server.setActionHandler(async (agentId, action) => {
      if (action.actionId && action.approved !== undefined) {
        await this.orchestrator.getInterceptor().resolveReview(action.actionId, action.approved, action.feedback);
        return { success: true, message: `Action ${action.actionId} resolved.` };
      }
      return { success: true, message: "Steering command acknowledged." };
    });
  }

  async start(port = 4099): Promise<number> {
    const boundPort = await this.server.listen(port);
    console.log(`[AetherOS] Sovereign Agent Node active on http://localhost:${boundPort}`);
    return boundPort;
  }

  async runGoal(goal: string, testCommand = "npm test"): Promise<any> {
    const task: TaskContract = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-task`,
      goal,
      invariants: ["Must pass verification tests"],
      maxBudgetUsd: 5,
      timeoutMs: 60000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return await this.orchestrator.executeGoal(task, testCommand);
  }

  async stop(): Promise<void> {
    await this.server.close();
  }
}
