"use client";

import React from "react";
import type { AgentState } from "@aether/types";

interface CalmHUDProps {
  state: AgentState;
  connected: boolean;
  onEmergencyStop?: () => void;
}

export const CalmHUD: React.FC<CalmHUDProps> = ({ state, connected, onEmergencyStop }) => {
  const stateColor: Record<AgentState, string> = {
    IDLE: "bg-zinc-500/10 text-zinc-400 border-zinc-700",
    PLANNING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    EXECUTING: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    WAITING_APPROVAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    BLOCKED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    COMPLETED: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    FAILED: "bg-rose-500/10 text-rose-400 border-rose-500/30"
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
          <h1 className="font-semibold text-lg tracking-tight text-zinc-100">AetherOS</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">OpenDots</span>
        </div>

        <div className={`text-xs px-2.5 py-1 rounded-md border font-medium uppercase tracking-wider ${stateColor[state]}`}>
          {state.replace("_", " ")}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Calm Ambient Mode</span>
        </div>

        <button
          onClick={onEmergencyStop}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
        >
          Emergency Pause
        </button>
      </div>
    </header>
  );
};
