/**
 * Example: Registering a Custom Sovereign Skill in AetherOS
 * Run with: npx tsx examples/custom-skill.ts
 */

import { SovereignSkillRegistry } from "../packages/skills/src/index.js";
import { z } from "zod";

async function run() {
  console.log("🌌 Registering custom weather analysis skill in AetherOS...");

  const registry = new SovereignSkillRegistry();

  // Register a custom domain skill
  registry.registerSkill({
    name: "skill_weather_advisor",
    description: "Fetches weather telemetry and calculates outdoor productivity index",
    parameters: z.object({
      city: z.string().describe("Target city name")
    }),
    handler: async ({ city }) => {
      // In production, this can call any public API or local sensor
      return {
        city,
        temperature: "22°C",
        condition: "Calm & Clear",
        cognitiveReadiness: "Optimal (Score: 98/100)",
        recommendation: "Excellent outdoor or indoor deep work conditions."
      };
    }
  });

  // Execute the registered skill
  const result = await registry.execute("skill_weather_advisor", { city: "San Francisco" });
  console.log("\nSkill Execution Output:");
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
