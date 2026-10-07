"use client";

import React, { useState } from "react";
import type { ToolLogEntry } from "../hooks/useAgentStream.js";

interface DualPlaneCanvasProps {
  thoughts: string[];
  tools: ToolLogEntry[];
  onSendCommand: (cmd: string) => void;
}

export const DualPlaneCanvas: React.FC<DualPlaneCanvasProps> = ({ thoughts, tools, onSendCommand }) => {
  const [inputVal, setInputVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSendCommand(inputVal.trim());
    setInputVal("");
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6 overflow-hidden">
      {/* Left Plane: Thought Stream & Conversational Steering */}
      <section className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 font-medium text-xs text-zinc-300 uppercase tracking-wider flex items-center justify-between">
          <span>Reasoning Stream</span>
          <span className="text-zinc-500 font-mono text-[11px]">{thoughts.length} events</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {thoughts.length === 0 ? (
            <p className="text-zinc-600 italic">Awaiting autonomous goal dispatch...</p>
          ) : (
            thoughts.map((thought, i) => (
              <div key={i} className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-zinc-300">
                <span className="text-zinc-500 select-none mr-2">›</span>
                {thought}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-950/80 flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Steer agent or type 'continue'..."
            className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-100 text-zinc-900 font-medium text-xs rounded-lg hover:bg-white transition-colors"
          >
            Steer
          </button>
        </form>
      </section>

      {/* Right Plane: Tool Invocations & Artifact Execution */}
      <section className="flex flex-col bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 font-medium text-xs text-zinc-300 uppercase tracking-wider flex items-center justify-between">
          <span>Tool Sandbox Activity</span>
          <span className="text-zinc-500 font-mono text-[11px]">{tools.length} invocations</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {tools.length === 0 ? (
            <p className="text-zinc-600 italic">No tools invoked yet.</p>
          ) : (
            tools.map((t, idx) => (
              <div key={idx} className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">{t.tool}</span>
                  {t.exitCode !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        t.exitCode === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      exit: {t.exitCode}
                    </span>
                  )}
                </div>

                {t.args && (
                  <pre className="text-zinc-400 text-[11px] overflow-x-auto bg-zinc-900/50 p-2 rounded">
                    {JSON.stringify(t.args, null, 2)}
                  </pre>
                )}

                {t.output && (
                  <div className="text-zinc-300 text-[11px] border-t border-zinc-800/80 pt-2">
                    <span className="text-zinc-500">Output: </span>
                    <span>{typeof t.output === "object" ? JSON.stringify(t.output) : String(t.output)}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
