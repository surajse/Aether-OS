import type { AgentState, AGUIEvent, TaskContract } from "@aether/types";
import { AgentStateSchema } from "@aether/types";
import { PersistentEventStore, type IEventStore } from "./db.js";

export class InvalidStateTransitionError extends Error {
  constructor(public fromState: AgentState, public toState: AgentState, reason?: string) {
    super(`Invalid transition from '${fromState}' to '${toState}'${reason ? `: ${reason}` : ""}`);
    this.name = "InvalidStateTransitionError";
  }
}

export class VerificationRequiredError extends Error {
  constructor(taskId: string) {
    super(`Cannot transition task '${taskId}' to COMPLETED without a valid verification receipt.`);
    this.name = "VerificationRequiredError";
  }
}

export type EventListener = (event: AGUIEvent) => void;

/**
 * Deterministic, Event-Sourced Agent Runtime Kernel.
 */
export class AgentRuntime {
  private currentState: AgentState = "IDLE";
  private currentTask: TaskContract | null = null;
  private hasVerificationReceipt = false;
  private listeners: Set<EventListener> = new Set();

  constructor(private eventStore: IEventStore = new PersistentEventStore()) {}

  getState(): AgentState {
    return this.currentState;
  }

  getTask(): TaskContract | null {
    return this.currentTask;
  }

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async startTask(task: TaskContract): Promise<void> {
    if (this.currentState !== "IDLE" && this.currentState !== "COMPLETED" && this.currentState !== "FAILED") {
      throw new InvalidStateTransitionError(this.currentState, "PLANNING", "Agent is currently busy with another task.");
    }
    this.currentTask = task;
    this.hasVerificationReceipt = false;
    await this.transitionTo("PLANNING");
  }

  /**
   * Registers an external verification receipt (e.g. green test exit code).
   * Required before transitioning to COMPLETED.
   */
  registerVerificationReceipt(receipt: { testSuite: string; passed: boolean; timestamp: number }): void {
    if (receipt.passed) {
      this.hasVerificationReceipt = true;
    }
  }

  async transitionTo(nextState: AgentState): Promise<void> {
    AgentStateSchema.parse(nextState);

    // Enforce valid transitions
    this.validateTransition(this.currentState, nextState);

    // Invariant: Verification proof of work required for COMPLETED
    if (nextState === "COMPLETED" && !this.hasVerificationReceipt) {
      throw new VerificationRequiredError(this.currentTask?.id || "unknown");
    }

    this.currentState = nextState;

    const event: AGUIEvent = {
      type: "LIFECYCLE",
      state: nextState,
      timestamp: Date.now()
    };

    if (this.currentTask) {
      await this.eventStore.append(this.currentTask.id, event);
    }

    this.notifyListeners(event);
  }

  async emitEvent(event: AGUIEvent): Promise<void> {
    if (this.currentTask) {
      await this.eventStore.append(this.currentTask.id, event);
    }
    this.notifyListeners(event);
  }

  async getHistory(taskId: string): Promise<AGUIEvent[]> {
    const records = await this.eventStore.getHistory(taskId);
    return records.map((r) => r.payload);
  }

  private notifyListeners(event: AGUIEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error("Error in event listener:", err);
      }
    }
  }

  private validateTransition(from: AgentState, to: AgentState): void {
    if (from === to) return;

    const allowedTransitions: Record<AgentState, AgentState[]> = {
      IDLE: ["PLANNING"],
      PLANNING: ["EXECUTING", "BLOCKED", "FAILED"],
      EXECUTING: ["WAITING_APPROVAL", "BLOCKED", "COMPLETED", "FAILED"],
      WAITING_APPROVAL: ["EXECUTING", "BLOCKED", "FAILED"],
      BLOCKED: ["PLANNING", "EXECUTING", "FAILED"],
      COMPLETED: ["IDLE", "PLANNING"],
      FAILED: ["IDLE", "PLANNING"]
    };

    const allowed = allowedTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new InvalidStateTransitionError(from, to);
    }
  }
}
