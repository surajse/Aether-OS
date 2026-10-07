"use client";

import React from "react";
import type { ActionReviewRequest } from "@aether/types";

interface ActionReviewModalProps {
  review: ActionReviewRequest;
  onResolve: (actionId: string, approved: boolean, feedback?: string) => void;
}

export const ActionReviewModal: React.FC<ActionReviewModalProps> = ({ review, onResolve }) => {
  const riskBadge: Record<string, string> = {
    LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    CRITICAL: "bg-rose-500/20 text-rose-400 border-rose-500/40"
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-100 text-sm">Action Review Required</span>
            <span className={`text-xs px-2 py-0.5 rounded border font-mono ${riskBadge[review.riskLevel]}`}>
              {review.riskLevel}
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">{review.toolName}</span>
        </div>

        <p className="text-sm text-zinc-300">{review.description}</p>

        {review.delta.command && (
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
            <span className="text-zinc-500">$ </span>
            {review.delta.command}
          </div>
        )}

        {review.delta.filesChanged && review.delta.filesChanged.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-zinc-400">Target Files:</span>
            <div className="flex flex-wrap gap-1">
              {review.delta.filesChanged.map((f, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            onClick={() => onResolve(review.actionId, false, "User rejected action.")}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            Reject Action
          </button>
          <button
            onClick={() => onResolve(review.actionId, true)}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
          >
            Approve & Execute
          </button>
        </div>
      </div>
    </div>
  );
};
