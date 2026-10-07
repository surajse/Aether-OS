import * as fs from "node:fs";
import * as path from "node:path";
import { exec, type ExecException } from "node:child_process";

export class SecurityViolationError extends Error {
  constructor(message: string) {
    super(`[SecurityViolation] ${message}`);
    this.name = "SecurityViolationError";
  }
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

export interface ISandbox {
  getRootDir(): string;
  resolveSafePath(targetPath: string): string;
  readFile(targetPath: string): Promise<string>;
  writeFile(targetPath: string, content: string): Promise<void>;
  deleteFile(targetPath: string): Promise<void>;
  listFiles(subDir?: string): Promise<string[]>;
  executeCommand(cmd: string, cwdRelative?: string, timeoutMs?: number): Promise<CommandResult>;
}

export class LocalProcessJail implements ISandbox {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
    if (!fs.existsSync(this.rootDir)) {
      fs.mkdirSync(this.rootDir, { recursive: true });
    }
  }

  getRootDir(): string {
    return this.rootDir;
  }

  /**
   * Resolves a path strictly within the root directory.
   * Throws SecurityViolationError if path attempts directory traversal.
   */
  resolveSafePath(targetPath: string): string {
    const resolved = path.isAbsolute(targetPath)
      ? path.resolve(targetPath)
      : path.resolve(this.rootDir, targetPath);

    // Normalize slashes for comparison
    const normRoot = path.normalize(this.rootDir) + path.sep;
    const normTarget = path.normalize(resolved);

    if (normTarget !== path.normalize(this.rootDir) && !normTarget.startsWith(normRoot)) {
      throw new SecurityViolationError(
        `Access denied: Target path '${targetPath}' resolves outside sandbox boundary '${this.rootDir}'.`
      );
    }

    return normTarget;
  }

  async readFile(targetPath: string): Promise<string> {
    const safePath = this.resolveSafePath(targetPath);
    if (!fs.existsSync(safePath)) {
      throw new Error(`File not found: ${targetPath}`);
    }
    return fs.promises.readFile(safePath, "utf-8");
  }

  async writeFile(targetPath: string, content: string): Promise<void> {
    const safePath = this.resolveSafePath(targetPath);
    const parentDir = path.dirname(safePath);
    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(safePath, content, "utf-8");
  }

  async deleteFile(targetPath: string): Promise<void> {
    const safePath = this.resolveSafePath(targetPath);
    if (fs.existsSync(safePath)) {
      await fs.promises.unlink(safePath);
    }
  }

  async listFiles(subDir = "."): Promise<string[]> {
    const safePath = this.resolveSafePath(subDir);
    if (!fs.existsSync(safePath)) {
      return [];
    }
    const entries = await fs.promises.readdir(safePath, { recursive: true });
    return entries.map(String);
  }

  /**
   * Executes a command jailed to the workspace with timeout protection.
   */
  async executeCommand(cmd: string, cwdRelative = ".", timeoutMs = 30000): Promise<CommandResult> {
    const executionCwd = this.resolveSafePath(cwdRelative);
    const startTime = Date.now();

    return new Promise<CommandResult>((resolve) => {
      const child = exec(
        cmd,
        {
          cwd: executionCwd,
          timeout: timeoutMs,
          maxBuffer: 10 * 1024 * 1024 // 10MB
        },
        (error: ExecException | null, stdout: string, stderr: string) => {
          const durationMs = Date.now() - startTime;
          const exitCode = error ? (typeof error.code === "number" ? error.code : 1) : 0;

          resolve({
            stdout: stdout || "",
            stderr: stderr || (error?.message ?? ""),
            exitCode,
            durationMs
          });
        }
      );

      // Guard against zombie child processes if node hangs
      if (timeoutMs > 0) {
        setTimeout(() => {
          if (!child.killed) {
            try {
              child.kill("SIGKILL");
            } catch {
              // Ignore already killed
            }
          }
        }, timeoutMs + 1000);
      }
    });
  }
}
