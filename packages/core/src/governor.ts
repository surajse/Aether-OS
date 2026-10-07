import type { RiskLevel } from "@aether/types";

export type DecisionDisposition = "AUTO_EXECUTE" | "DEFERRED_DIGEST" | "AMBIENT_INTERRUPT";

export interface AttentionMetrics {
  userVelocityWpm: number; // Words per minute or interactions per minute
  idleDurationMs: number;
  localHour: number; // 0 - 23
}

export interface ActionImpact {
  riskLevel: RiskLevel;
  financialImpactUsd: number;
  isIrreversible: boolean;
  timeCritical: boolean;
}

export class CognitiveGovernor {
  private interruptThreshold: number;

  constructor(interruptThreshold = 10.0) {
    this.interruptThreshold = interruptThreshold;
  }

  /**
   * Calculates the Attention Debt Index:
   * Score = (Irreversibility_Weight * Financial_Impact) / (User_Velocity + epsilon)
   */
  calculateAttentionDebt(impact: ActionImpact, metrics: AttentionMetrics): number {
    const irreversibilityWeight = impact.isIrreversible ? 3.0 : 1.0;
    const riskMultiplier: Record<RiskLevel, number> = {
      LOW: 0.5,
      MEDIUM: 1.5,
      HIGH: 4.0,
      CRITICAL: 10.0
    };

    const numerator = irreversibilityWeight * riskMultiplier[impact.riskLevel] * Math.max(1, impact.financialImpactUsd);
    const denominator = Math.max(0.1, metrics.userVelocityWpm / 10);

    return Number((numerator / denominator).toFixed(2));
  }

  /**
   * Evaluates action disposition respecting ergonomics, circadian rhythms, and attention debt.
   */
  evaluateDisposition(impact: ActionImpact, metrics: AttentionMetrics): DecisionDisposition {
    // 1. Chronobiological Guardrail: Between 23:00 and 06:00
    const isNightShift = metrics.localHour >= 23 || metrics.localHour < 6;
    if (isNightShift && !impact.timeCritical) {
      return "DEFERRED_DIGEST";
    }

    // 2. Low risk always auto-executes
    if (impact.riskLevel === "LOW" && !impact.isIrreversible && impact.financialImpactUsd === 0) {
      return "AUTO_EXECUTE";
    }

    // 3. Compute Attention Debt
    const debt = this.calculateAttentionDebt(impact, metrics);

    // 4. Time-critical critical actions require immediate ambient alert
    if (impact.riskLevel === "CRITICAL" || (debt > this.interruptThreshold && impact.timeCritical)) {
      return "AMBIENT_INTERRUPT";
    }

    // 5. Default to deferred digest to prevent flow-state destruction
    return "DEFERRED_DIGEST";
  }
}
