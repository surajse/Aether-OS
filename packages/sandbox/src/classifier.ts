import type { RiskLevel } from "@aether/types";

export interface ClassifiedAction {
  riskLevel: RiskLevel;
  isIrreversible: boolean;
  reasons: string[];
}

export class ActionClassifier {
  private static readonly CRITICAL_PATTERNS = [
    /\brm\s+-[rf]{1,2}\s+[\/\*]/i,
    /\bformat\b/i,
    /\bdel\s+\/s\s+\/q\s+[c-z]:\\/i,
    /\bdrop\s+(database|table)\b/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\breg\s+delete\b/i,
    /\bdiskpart\b/i
  ];

  private static readonly HIGH_PATTERNS = [
    /\bgit\s+push\b/i,
    /\bgit\s+reset\s+--hard\b/i,
    /\b(npm|pnpm|yarn|bun)\s+(install|add|remove|uninstall)\b/i,
    /\bpip\s+(install|uninstall)\b/i,
    /\b(curl|wget)\b/i,
    /\brm\b/i,
    /\bdel\b/i,
    /\bkill\b/i,
    /\btaskkill\b/i
  ];

  private static readonly MEDIUM_PATTERNS = [
    /\bgit\s+(commit|add|checkout|branch|stash)\b/i,
    /\b(npm|pnpm|yarn|bun)\s+(run|test|build)\b/i,
    /\b(tsc|vitest|jest|pytest)\b/i,
    /\b(mkdir|touch|cp|mv|copy|move)\b/i
  ];

  private static readonly LOW_PATTERNS = [
    /\b(ls|dir|cat|type|head|tail|pwd|echo)\b/i,
    /\bgit\s+(status|log|diff|branch|show)\b/i
  ];

  classifyCommand(cmd: string): ClassifiedAction {
    const trimmed = cmd.trim();

    // 1. Check for Critical Patterns
    for (const pattern of ActionClassifier.CRITICAL_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          riskLevel: "CRITICAL",
          isIrreversible: true,
          reasons: [`Matches critical destructive pattern: ${pattern.toString()}`]
        };
      }
    }

    // 2. Check for High Patterns
    for (const pattern of ActionClassifier.HIGH_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          riskLevel: "HIGH",
          isIrreversible: false,
          reasons: [`Matches external side-effect / mutation pattern: ${pattern.toString()}`]
        };
      }
    }

    // 3. Check for Medium Patterns
    for (const pattern of ActionClassifier.MEDIUM_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          riskLevel: "MEDIUM",
          isIrreversible: false,
          reasons: [`Matches local build or version control mutation pattern: ${pattern.toString()}`]
        };
      }
    }

    // 4. Check for Low Patterns
    for (const pattern of ActionClassifier.LOW_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          riskLevel: "LOW",
          isIrreversible: false,
          reasons: [`Matches read-only inspection pattern: ${pattern.toString()}`]
        };
      }
    }

    // Default unclassified commands to MEDIUM
    return {
      riskLevel: "MEDIUM",
      isIrreversible: false,
      reasons: ["Unknown command structure, classified conservatively as MEDIUM."]
    };
  }

  classifyFileModification(filePath: string, isDeletion: boolean): ClassifiedAction {
    if (isDeletion) {
      return {
        riskLevel: "HIGH",
        isIrreversible: true,
        reasons: [`File deletion for '${filePath}' is inherently high risk.`]
      };
    }

    const sensitivePatterns = [/\.env/i, /id_rsa/i, /credentials/i, /k8s/i, /docker-compose/i];
    for (const pattern of sensitivePatterns) {
      if (pattern.test(filePath)) {
        return {
          riskLevel: "HIGH",
          isIrreversible: false,
          reasons: [`Modification to sensitive configuration file '${filePath}'.`]
        };
      }
    }

    return {
      riskLevel: "LOW",
      isIrreversible: false,
      reasons: [`Standard project file mutation: '${filePath}'.`]
    };
  }
}
