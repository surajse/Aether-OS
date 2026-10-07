import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";
import { LocalProcessJail, SecurityViolationError } from "../src/jail.js";
import { ActionClassifier } from "../src/classifier.js";

describe("LocalProcessJail & Security Sandbox", () => {
  let tempDir: string;
  let sandbox: LocalProcessJail;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `aether-sandbox-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    sandbox = new LocalProcessJail(tempDir);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // ignore cleanup errors on windows locks
      }
    }
  });

  it("resolves valid paths inside the root boundary", () => {
    const safe = sandbox.resolveSafePath("src/index.ts");
    expect(safe.startsWith(tempDir)).toBe(true);
  });

  it("throws SecurityViolationError on parent directory traversal attempts", () => {
    expect(() => sandbox.resolveSafePath("../../etc/passwd")).toThrow(SecurityViolationError);
    expect(() => sandbox.resolveSafePath("../outside.txt")).toThrow(SecurityViolationError);
  });

  it("writes, reads, and deletes files safely", async () => {
    await sandbox.writeFile("sub/test.txt", "hello aether");
    const content = await sandbox.readFile("sub/test.txt");
    expect(content).toBe("hello aether");

    await sandbox.deleteFile("sub/test.txt");
    await expect(sandbox.readFile("sub/test.txt")).rejects.toThrow();
  });

  it("executes standard commands within jail", async () => {
    const result = await sandbox.executeCommand("node -e \"console.log('sandbox alive')\"");
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("sandbox alive");
  });

  it("captures non-zero exit codes on command failure", async () => {
    const result = await sandbox.executeCommand("node -e \"process.exit(42)\"");
    expect(result.exitCode).toBe(42);
  });

  it("terminates commands that exceed timeout limit", async () => {
    const result = await sandbox.executeCommand("node -e \"setTimeout(() => {}, 5000)\"", ".", 500);
    expect(result.exitCode).not.toBe(0);
  });
});

describe("ActionClassifier", () => {
  const classifier = new ActionClassifier();

  it("classifies read-only commands as LOW", () => {
    expect(classifier.classifyCommand("git status").riskLevel).toBe("LOW");
    expect(classifier.classifyCommand("cat README.md").riskLevel).toBe("LOW");
  });

  it("classifies local builds and commits as MEDIUM", () => {
    expect(classifier.classifyCommand("pnpm test").riskLevel).toBe("MEDIUM");
    expect(classifier.classifyCommand("git commit -m 'feat: add runtime'").riskLevel).toBe("MEDIUM");
  });

  it("classifies network pushes and package installs as HIGH", () => {
    expect(classifier.classifyCommand("git push origin main").riskLevel).toBe("HIGH");
    expect(classifier.classifyCommand("npm install lodash").riskLevel).toBe("HIGH");
  });

  it("classifies destructive commands as CRITICAL and irreversible", () => {
    const result = classifier.classifyCommand("rm -rf /");
    expect(result.riskLevel).toBe("CRITICAL");
    expect(result.isIrreversible).toBe(true);
  });

  it("classifies sensitive file edits as HIGH", () => {
    expect(classifier.classifyFileModification(".env.production", false).riskLevel).toBe("HIGH");
    expect(classifier.classifyFileModification("src/utils.ts", true).riskLevel).toBe("HIGH");
    expect(classifier.classifyFileModification("src/utils.ts", false).riskLevel).toBe("LOW");
  });
});
