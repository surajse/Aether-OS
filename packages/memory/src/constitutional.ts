/**
 * The Constitutional Anchor.
 * Read-only core principles that cannot be modified or degraded by memory drift.
 */
export class ConstitutionalAnchor {
  public static readonly IMMUTABLE_INVARIANTS = Object.freeze([
    "Never leak raw API credentials, encryption keys, or secrets.",
    "Never bypass path chroot or execute arbitrary destructive root filesystem commands.",
    "Never transition a task to COMPLETED without an objective, passing verification receipt.",
    "Never execute Class 3 (irreversible/financial) actions without human review.",
    "Always preserve user data sovereignty and operate local-first whenever feasible."
  ]);

  getInvariants(): readonly string[] {
    return ConstitutionalAnchor.IMMUTABLE_INVARIANTS;
  }

  /**
   * Asserts that a proposed action or memory does not violate constitutional invariants.
   */
  validateActionAgainstConstitutionalRules(proposal: string): { valid: boolean; violation?: string } {
    const lower = proposal.toLowerCase();

    if (lower.includes("leak secret") || lower.includes("expose api key") || lower.includes("cat .env > external")) {
      return { valid: false, violation: "Violates Invariant #1: Secret leakage." };
    }

    if (lower.includes("bypass sandbox") || lower.includes("escape jail") || lower.includes("rm -rf /")) {
      return { valid: false, violation: "Violates Invariant #2: Sandbox breakout." };
    }

    return { valid: true };
  }
}
