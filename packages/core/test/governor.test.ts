import { describe, it, expect } from "vitest";
import { CognitiveGovernor } from "../src/governor.js";

describe("CognitiveGovernor & Attention Debt Index", () => {
  const governor = new CognitiveGovernor(10.0);

  it("calculates lower attention debt for low-risk actions during normal interaction", () => {
    const debt = governor.calculateAttentionDebt(
      { riskLevel: "LOW", financialImpactUsd: 0, isIrreversible: false, timeCritical: false },
      { userVelocityWpm: 40, idleDurationMs: 5000, localHour: 14 }
    );
    expect(debt).toBeLessThan(1.0);
  });

  it("auto-executes low-risk reversible zero-cost actions", () => {
    const disposition = governor.evaluateDisposition(
      { riskLevel: "LOW", financialImpactUsd: 0, isIrreversible: false, timeCritical: false },
      { userVelocityWpm: 40, idleDurationMs: 2000, localHour: 14 }
    );
    expect(disposition).toBe("AUTO_EXECUTE");
  });

  it("triggers ambient interrupt for critical irreversible actions", () => {
    const disposition = governor.evaluateDisposition(
      { riskLevel: "CRITICAL", financialImpactUsd: 500, isIrreversible: true, timeCritical: true },
      { userVelocityWpm: 10, idleDurationMs: 1000, localHour: 14 }
    );
    expect(disposition).toBe("AMBIENT_INTERRUPT");
  });

  it("defers non-critical actions to morning digest during night-shift hours (e.g. 02:00 AM)", () => {
    const disposition = governor.evaluateDisposition(
      { riskLevel: "MEDIUM", financialImpactUsd: 5, isIrreversible: false, timeCritical: false },
      { userVelocityWpm: 0, idleDurationMs: 60000, localHour: 2 }
    );
    expect(disposition).toBe("DEFERRED_DIGEST");
  });
});
