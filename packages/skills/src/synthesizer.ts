import type { MCPManager, RegisteredTool } from "@aether/protocol";

export interface TrajectoryStep {
  toolName: string;
  argsSignature: string;
}

export class SkillSynthesizer {
  private trajectoryHistory: TrajectoryStep[][] = [];
  private synthesizedSkills: Map<string, RegisteredTool> = new Map();

  constructor(private mcpManager: MCPManager) {}

  recordTrajectory(steps: { toolName: string; args: Record<string, any> }[]): void {
    const signatureSequence = steps.map((s) => ({
      toolName: s.toolName,
      argsSignature: Object.keys(s.args).sort().join(",")
    }));
    this.trajectoryHistory.push(signatureSequence);
  }

  /**
   * Scans history for repeated successful patterns (>= minRepetitions).
   */
  detectRepeatedPatterns(minRepetitions = 3): string[] {
    const counts = new Map<string, number>();

    for (const trajectory of this.trajectoryHistory) {
      const key = trajectory.map((t) => t.toolName).join(" -> ");
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const detected: string[] = [];
    for (const [pattern, count] of counts.entries()) {
      if (count >= minRepetitions) {
        detected.push(pattern);
      }
    }

    return detected;
  }

  /**
   * Synthesizes and registers a new high-level composite skill into MCPManager.
   */
  synthesizeCompositeSkill(
    skillName: string,
    description: string,
    toolSequence: string[],
    compositeHandler: (args: any) => Promise<any>
  ): RegisteredTool {
    const tool: RegisteredTool = {
      name: skillName,
      description: `${description} (Synthesized autonomous skill from pattern: ${toolSequence.join(" -> ")})`,
      parameters: {
        type: "object",
        properties: {
          payload: { type: "string", description: "Input payload for composite execution" }
        }
      },
      handler: compositeHandler
    };

    this.synthesizedSkills.set(skillName, tool);
    this.mcpManager.registerTool(tool);
    return tool;
  }

  getSynthesizedSkills(): RegisteredTool[] {
    return Array.from(this.synthesizedSkills.values());
  }
}
