import { describe, it, expect } from "vitest";
import {
  AgentStateSchema,
  RiskLevelSchema,
  TaskContractSchema,
  ActionReviewRequestSchema,
  AGUIEventSchema
} from "../src/index.js";

describe("AetherOS Type Contracts & Schemas", () => {
  it("validates valid AgentState values", () => {
    expect(AgentStateSchema.parse("IDLE")).toBe("IDLE");
    expect(AgentStateSchema.parse("PLANNING")).toBe("PLANNING");
    expect(AgentStateSchema.parse("EXECUTING")).toBe("EXECUTING");
    expect(AgentStateSchema.parse("WAITING_APPROVAL")).toBe("WAITING_APPROVAL");
    expect(AgentStateSchema.parse("COMPLETED")).toBe("COMPLETED");
  });

  it("rejects invalid AgentState values", () => {
    expect(() => AgentStateSchema.parse("UNKNOWN_STATE")).toThrow();
  });

  it("validates RiskLevelSchema correctly", () => {
    expect(RiskLevelSchema.parse("LOW")).toBe("LOW");
    expect(RiskLevelSchema.parse("CRITICAL")).toBe("CRITICAL");
    expect(() => RiskLevelSchema.parse("NEGLIGIBLE")).toThrow();
  });

  it("parses valid TaskContract", () => {
    const raw = {
      id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      goal: "Refactor database migrations to PostgreSQL",
      invariants: ["Do not drop customer tables"],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const contract = TaskContractSchema.parse(raw);
    expect(contract.goal).toBe("Refactor database migrations to PostgreSQL");
    expect(contract.maxBudgetUsd).toBe(5.0); // default
  });

  it("validates AGUIEvent lifecycle and thought chunk events", () => {
    const lifecycleEvent = {
      type: "LIFECYCLE" as const,
      state: "EXECUTING" as const,
      timestamp: Date.now()
    };
    expect(AGUIEventSchema.parse(lifecycleEvent).type).toBe("LIFECYCLE");

    const thoughtEvent = {
      type: "THOUGHT_CHUNK" as const,
      chunk: "Analyzing the repository structure...",
      timestamp: Date.now()
    };
    expect(AGUIEventSchema.parse(thoughtEvent).type).toBe("THOUGHT_CHUNK");
  });

  it("validates ActionReviewRequest within AGUIEvent", () => {
    const reviewEvent = {
      type: "ACTION_REVIEW_REQUIRED" as const,
      review: {
        actionId: "11111111-2222-3333-4444-555555555555",
        taskId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        riskLevel: "HIGH" as const,
        toolName: "execute_command",
        description: "Deploy to production server",
        delta: {
          filesChanged: ["dist/bundle.js"],
          command: "kubectl apply -f k8s/prod.yaml"
        },
        requestedAt: Date.now()
      },
      timestamp: Date.now()
    };
    const parsed = AGUIEventSchema.parse(reviewEvent);
    expect(parsed.type).toBe("ACTION_REVIEW_REQUIRED");
  });
});
