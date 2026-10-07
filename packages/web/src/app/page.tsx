"use client";

import React from "react";
import { useAgentStream } from "../hooks/useAgentStream.js";
import { CalmHUD } from "../components/CalmHUD.js";
import { DualPlaneCanvas } from "../components/DualPlaneCanvas.js";
import { ActionReviewModal } from "../components/ActionReviewModal.js";

export default function AetherDashboard() {
  const { state, thoughts, tools, pendingReview, connected, sendAction } = useAgentStream("default-agent");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <CalmHUD state={state} connected={connected} onEmergencyStop={() => sendAction({ command: "KILL_AGENT" })} />

      <DualPlaneCanvas
        thoughts={thoughts}
        tools={tools}
        onSendCommand={(cmd) => sendAction({ command: cmd })}
      />

      {pendingReview && (
        <ActionReviewModal
          review={pendingReview}
          onResolve={(actionId, approved, feedback) =>
            sendAction({ actionId, approved, feedback })
          }
        />
      )}
    </main>
  );
}
