"use client";

import { useEffect, useState, useCallback } from "react";
import type { AgentState, ActionReviewRequest } from "@aether/types";

export interface ToolLogEntry {
  tool: string;
  args?: Record<string, any>;
  output?: any;
  exitCode?: number;
}

export function useAgentStream(agentId: string) {
  const [state, setState] = useState<AgentState>("IDLE");
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [tools, setTools] = useState<ToolLogEntry[]>([]);
  const [pendingReview, setPendingReview] = useState<ActionReviewRequest | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`/api/agents/${agentId}/stream`);

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.addEventListener("lifecycle:start", (e: any) => {
      const data = JSON.parse(e.data);
      setState(data.state || "PLANNING");
    });

    es.addEventListener("lifecycle:pause", () => {
      setState("WAITING_APPROVAL");
    });

    es.addEventListener("lifecycle:finish", () => {
      setState("COMPLETED");
    });

    es.addEventListener("thought:chunk", (e: any) => {
      const data = JSON.parse(e.data);
      if (data.chunk) {
        setThoughts((prev) => [...prev, data.chunk]);
      }
    });

    es.addEventListener("tool:requested", (e: any) => {
      const data = JSON.parse(e.data);
      setTools((prev) => [...prev, { tool: data.tool, args: data.args }]);
    });

    es.addEventListener("tool:finished", (e: any) => {
      const data = JSON.parse(e.data);
      setTools((prev) =>
        prev.map((t) => (t.tool === data.tool ? { ...t, output: data.output, exitCode: data.exitCode } : t))
      );
    });

    es.addEventListener("review:requested", (e: any) => {
      const data = JSON.parse(e.data);
      setPendingReview(data.review);
      setState("WAITING_APPROVAL");
    });

    return () => {
      es.close();
    };
  }, [agentId]);

  const sendAction = useCallback(
    async (action: { actionId?: string; approved?: boolean; feedback?: string; command?: string }) => {
      await fetch(`/api/agents/${agentId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action)
      });
      if (action.actionId) {
        setPendingReview(null);
      }
    },
    [agentId]
  );

  return {
    state,
    thoughts,
    tools,
    pendingReview,
    connected,
    sendAction
  };
}
