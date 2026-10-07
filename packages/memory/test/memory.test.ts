import { describe, it, expect } from "vitest";
import { ConstitutionalAnchor } from "../src/constitutional.js";
import { TemporalKnowledgeGraph } from "../src/knowledge_graph.js";

describe("ConstitutionalAnchor", () => {
  const anchor = new ConstitutionalAnchor();

  it("exposes immutable constitutional invariants", () => {
    const invariants = anchor.getInvariants();
    expect(invariants.length).toBeGreaterThan(0);
    expect(invariants[0]).toContain("credentials");
  });

  it("blocks actions violating constitutional invariants", () => {
    const check1 = anchor.validateActionAgainstConstitutionalRules("Expose api key in public log");
    expect(check1.valid).toBe(false);

    const check2 = anchor.validateActionAgainstConstitutionalRules("Refactor database schema cleanly");
    expect(check2.valid).toBe(true);
  });
});

describe("TemporalKnowledgeGraph", () => {
  it("stores active facts and supersedes outdated contradictory facts", () => {
    const kg = new TemporalKnowledgeGraph();

    // User initially prefers npm
    kg.assertFact("user", "prefers_package_manager", "npm");
    let active = kg.getActiveFacts("user");
    expect(active.length).toBe(1);
    expect(active[0].object).toBe("npm");

    // Later user switches preference to pnpm
    kg.assertFact("user", "prefers_package_manager", "pnpm");

    active = kg.getActiveFacts("user");
    expect(active.length).toBe(1);
    expect(active[0].object).toBe("pnpm"); // Only new fact is active

    // Historical audit retains both
    const history = kg.getFactHistory("user", "prefers_package_manager");
    expect(history.length).toBe(2);
    expect(history[0].object).toBe("npm");
    expect(history[0].validTo).toBeDefined(); // superseded
    expect(history[1].object).toBe("pnpm");
    expect(history[1].validTo).toBeUndefined(); // currently active
  });
});
