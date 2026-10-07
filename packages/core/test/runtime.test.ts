import { describe, it, expect } from "vitest";
import { AgentRuntime, InvalidStateTransitionError, VerificationRequiredError } from "../src/runtime.js";
import { PersistentEventStore } from "../src/db.js";
import type { TaskContract } from "@aether/types";

describe("AgentRuntime State Machine", () => {
  const dummyTask: TaskContract = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    goal: "Implement authentication provider",
    invariants: ["Never expose passwords"],
    maxBudgetUsd: 10,
    timeoutMs: 60000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it("initializes in IDLE state", () => {
    const runtime = new AgentRuntime();
    expect(runtime.getState()).toBe("IDLE");
  });

  it("transitions from IDLE to PLANNING when starting a task", async () => {
    const runtime = new AgentRuntime();
    await runtime.startTask(dummyTask);
    expect(runtime.getState()).toBe("PLANNING");
    expect(runtime.getTask()?.id).toBe(dummyTask.id);
  });

  it("transitions through valid states: PLANNING -> EXECUTING", async () => {
    const runtime = new AgentRuntime();
    await runtime.startTask(dummyTask);
    await runtime.transitionTo("EXECUTING");
    expect(runtime.getState()).toBe("EXECUTING");
  });

  it("rejects invalid state transition directly from IDLE to COMPLETED", async () => {
    const runtime = new AgentRuntime();
    await expect(runtime.transitionTo("COMPLETED")).rejects.toThrow(InvalidStateTransitionError);
  });

  it("blocks transition to COMPLETED without a verification receipt", async () => {
    const runtime = new AgentRuntime();
    await runtime.startTask(dummyTask);
    await runtime.transitionTo("EXECUTING");

    await expect(runtime.transitionTo("COMPLETED")).rejects.toThrow(VerificationRequiredError);
  });

  it("allows transition to COMPLETED once verification receipt is registered", async () => {
    const runtime = new AgentRuntime();
    await runtime.startTask(dummyTask);
    await runtime.transitionTo("EXECUTING");

    runtime.registerVerificationReceipt({
      testSuite: "vitest",
      passed: true,
      timestamp: Date.now()
    });

    await runtime.transitionTo("COMPLETED");
    expect(runtime.getState()).toBe("COMPLETED");
  });

  it("persists lifecycle events and reconstructs history", async () => {
    const eventStore = new PersistentEventStore();
    const runtime = new AgentRuntime(eventStore);

    await runtime.startTask(dummyTask);
    await runtime.transitionTo("EXECUTING");

    const history = await runtime.getHistory(dummyTask.id);
    expect(history.length).toBe(2);
    expect(history[0].type).toBe("LIFECYCLE");
    expect((history[0] as any).state).toBe("PLANNING");
    expect(history[1].type).toBe("LIFECYCLE");
    expect((history[1] as any).state).toBe("EXECUTING");
  });
});
