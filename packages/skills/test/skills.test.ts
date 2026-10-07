import { describe, it, expect } from "vitest";
import { MCPManager } from "@aether/protocol";
import { SkillSynthesizer } from "../src/synthesizer.js";

describe("SkillSynthesizer", () => {
  it("detects repeating tool patterns and synthesizes a reusable MCP skill", async () => {
    const mcp = new MCPManager();
    const synthesizer = new SkillSynthesizer(mcp);

    const commonTrajectory = [
      { toolName: "read_file", args: { path: "package.json" } },
      { toolName: "execute_command", args: { command: "pnpm test" } }
    ];

    // Record pattern 3 times
    synthesizer.recordTrajectory(commonTrajectory);
    synthesizer.recordTrajectory(commonTrajectory);
    synthesizer.recordTrajectory(commonTrajectory);

    const patterns = synthesizer.detectRepeatedPatterns(3);
    expect(patterns.length).toBe(1);
    expect(patterns[0]).toBe("read_file -> execute_command");

    // Synthesize composite skill
    const skill = synthesizer.synthesizeCompositeSkill(
      "verify_package_health",
      "Read package config and run tests in sequence",
      ["read_file", "execute_command"],
      async () => ({ healthy: true })
    );

    expect(skill.name).toBe("verify_package_health");

    // Test execution through MCPManager
    const result = await mcp.executeTool("verify_package_health", { payload: "run" });
    expect(result.success).toBe(true);
    expect(result.output.healthy).toBe(true);
  });
});
