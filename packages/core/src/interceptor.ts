import type { ActionReviewRequest, RiskLevel } from "@aether/types";
import type { AgentRuntime } from "./runtime.js";

export interface PendingActionExecution {
  request: ActionReviewRequest;
  resolve: (value: { approved: boolean; feedback?: string }) => void;
  reject: (reason?: any) => void;
}

export class ActionReviewInterceptor {
  private pendingActions: Map<string, PendingActionExecution> = new Map();
  private completedSuccessfulActionsCount = 0;

  constructor(private runtime: AgentRuntime) {}

  /**
   * Evaluates if an action can proceed automatically or requires human review.
   */
  async interceptAction(
    taskId: string,
    toolName: string,
    riskLevel: RiskLevel,
    description: string,
    delta: { filesChanged: string[]; diffContent?: string; command?: string }
  ): Promise<{ approved: boolean; feedback?: string }> {
    // Low risk actions auto-approve
    if (riskLevel === "LOW") {
      this.completedSuccessfulActionsCount++;
      return { approved: true };
    }

    // Medium risk actions: Auto-approve if Bayesian trust threshold is earned (e.g. 5+ clean tasks)
    if (riskLevel === "MEDIUM" && this.completedSuccessfulActionsCount >= 5) {
      this.completedSuccessfulActionsCount++;
      return { approved: true, feedback: "Auto-approved via Bayesian trust stake." };
    }

    // High and Critical risk actions suspend execution and request approval
    const actionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const request: ActionReviewRequest = {
      actionId,
      taskId,
      riskLevel,
      toolName,
      description,
      delta,
      status: "PENDING",
      requestedAt: Date.now()
    };

    // Transition runtime to WAITING_APPROVAL
    await this.runtime.transitionTo("WAITING_APPROVAL");

    // Emit event for clients (Generative UI Action Review Modal)
    await this.runtime.emitEvent({
      type: "ACTION_REVIEW_REQUIRED",
      review: request,
      timestamp: Date.now()
    });

    return new Promise<{ approved: boolean; feedback?: string }>((resolve, reject) => {
      this.pendingActions.set(actionId, { request, resolve, reject });
    });
  }

  /**
   * Resolves a pending review from human input.
   */
  async resolveReview(actionId: string, approved: boolean, feedback?: string): Promise<void> {
    const pending = this.pendingActions.get(actionId);
    if (!pending) {
      throw new Error(`Action review '${actionId}' not found or already resolved.`);
    }

    this.pendingActions.delete(actionId);
    pending.request.status = approved ? "APPROVED" : "REJECTED";

    // Resume execution
    if (approved) {
      this.completedSuccessfulActionsCount++;
      await this.runtime.transitionTo("EXECUTING");
    } else {
      await this.runtime.transitionTo("BLOCKED");
    }

    pending.resolve({ approved, feedback });
  }

  getPendingReviews(): ActionReviewRequest[] {
    return Array.from(this.pendingActions.values()).map((p) => p.request);
  }
}
