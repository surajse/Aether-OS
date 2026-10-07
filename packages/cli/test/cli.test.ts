import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import { AetherNode } from "../src/index.js";

describe("AetherNode CLI & Daemon Runner", () => {
  let tempDir: string;
  let node: AetherNode;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `aether-cli-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    node = new AetherNode({
      workspaceDir: tempDir
    });
  });

  afterEach(async () => {
    await node.stop();
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  });

  it("boots the node and listens on ephemeral port", async () => {
    const port = await node.start(0);
    expect(port).toBeGreaterThan(0);
  });

  it("initializes memory subsystem and constitutional invariants", () => {
    expect(node.constitutionalAnchor.getInvariants().length).toBeGreaterThan(0);
    node.knowledgeGraph.assertFact("system", "status", "active");
    expect(node.knowledgeGraph.getActiveFacts("system").length).toBe(1);
  });

  it("exposes registered sovereign skills via REST /api/skills", async () => {
    const port = await node.start(0);
    const res = await fetch(`http://localhost:${port}/api/skills`);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.count).toBeGreaterThanOrEqual(3);
    const skillNames = body.skills.map((s: any) => s.name);
    expect(skillNames).toContain("skill_code_reviewer");
    expect(skillNames).toContain("skill_morning_brief");
    expect(skillNames).toContain("skill_dependency_auditor");
  });
});
