import type { AGUIEvent, AgentState, ActionReviewRequest } from "@aether/types";

/**
 * 17 Canonical AG-UI / A2UI Event Types
 */
export type AGUIEventType =
  | "lifecycle:start"
  | "lifecycle:pause"
  | "lifecycle:resume"
  | "lifecycle:finish"
  | "thought:chunk"
  | "thought:milestone"
  | "tool:requested"
  | "tool:started"
  | "tool:chunk"
  | "tool:finished"
  | "tool:error"
  | "review:requested"
  | "review:approved"
  | "review:rejected"
  | "diff:emit"
  | "widget:render"
  | "state:sync";

export interface FormattedSSEEvent {
  id: string;
  event: AGUIEventType;
  data: Record<string, any>;
  timestamp: number;
}

export class AGUIEventFormatter {
  static formatEvent(event: AGUIEvent): FormattedSSEEvent {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const timestamp = event.timestamp || Date.now();

    switch (event.type) {
      case "LIFECYCLE": {
        const eventName: AGUIEventType =
          event.state === "COMPLETED"
            ? "lifecycle:finish"
            : event.state === "WAITING_APPROVAL"
            ? "lifecycle:pause"
            : "lifecycle:start";
        return { id, event: eventName, data: { state: event.state }, timestamp };
      }

      case "THOUGHT_CHUNK":
        return {
          id,
          event: "thought:chunk",
          data: { chunk: event.chunk },
          timestamp
        };

      case "TOOL_INVOCATION":
        return {
          id,
          event: "tool:requested",
          data: { tool: event.tool, args: event.args },
          timestamp
        };

      case "TOOL_RESULT":
        return {
          id,
          event: event.exitCode === 0 ? "tool:finished" : "tool:error",
          data: { tool: event.tool, output: event.output, exitCode: event.exitCode },
          timestamp
        };

      case "ACTION_REVIEW_REQUIRED":
        return {
          id,
          event: "review:requested",
          data: { review: event.review },
          timestamp
        };

      case "DIFF_EMIT":
        return {
          id,
          event: "diff:emit",
          data: { filePath: event.filePath, unifiedDiff: event.unifiedDiff },
          timestamp
        };

      case "GENERATIVE_WIDGET":
        return {
          id,
          event: "widget:render",
          data: { widgetType: event.widgetType, props: event.props },
          timestamp
        };

      default:
        return {
          id,
          event: "state:sync",
          data: event,
          timestamp
        };
    }
  }

  static serializeSSE(sseEvent: FormattedSSEEvent): string {
    return `id: ${sseEvent.id}\nevent: ${sseEvent.event}\ndata: ${JSON.stringify(sseEvent.data)}\n\n`;
  }
}
