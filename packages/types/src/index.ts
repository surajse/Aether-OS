import { z } from "zod";

/**
 * 1. Agent Runtime States
 */
export const AgentStateSchema = z.enum([
  "IDLE",
  "PLANNING",
  "EXECUTING",
  "WAITING_APPROVAL",
  "BLOCKED",
  "COMPLETED",
  "FAILED"
]);
export type AgentState = z.infer<typeof AgentStateSchema>;

/**
 * 2. Action Risk Classification
 */
export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/**
 * 3. Task Contract Specification
 */
export const TaskContractSchema = z.object({
  id: z.string().uuid(),
  goal: z.string().min(1),
  invariants: z.array(z.string()).default([]),
  maxBudgetUsd: z.number().positive().default(5.0),
  timeoutMs: z.number().int().positive().default(300000),
  createdAt: z.number(),
  updatedAt: z.number()
});
export type TaskContract = z.infer<typeof TaskContractSchema>;

/**
 * 4. Action Review Request (Human-in-the-Loop Interceptor)
 */
export const ActionReviewRequestSchema = z.object({
  actionId: z.string().uuid(),
  taskId: z.string().uuid(),
  riskLevel: RiskLevelSchema,
  toolName: z.string(),
  description: z.string(),
  delta: z.object({
    filesChanged: z.array(z.string()),
    diffContent: z.string().optional(),
    command: z.string().optional()
  }),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "MODIFIED"]).default("PENDING"),
  requestedAt: z.number()
});
export type ActionReviewRequest = z.infer<typeof ActionReviewRequestSchema>;

/**
 * 5. AG-UI / A2UI Streaming Event Specification (17 Canonical Types)
 */
export const AGUIEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("LIFECYCLE"),
    state: AgentStateSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("THOUGHT_CHUNK"),
    chunk: z.string(),
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("TOOL_INVOCATION"),
    tool: z.string(),
    args: z.record(z.any()),
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("TOOL_RESULT"),
    tool: z.string(),
    output: z.any(),
    exitCode: z.number(),
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("ACTION_REVIEW_REQUIRED"),
    review: ActionReviewRequestSchema,
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("DIFF_EMIT"),
    filePath: z.string(),
    unifiedDiff: z.string(),
    timestamp: z.number()
  }),
  z.object({
    type: z.literal("GENERATIVE_WIDGET"),
    widgetType: z.string(),
    props: z.record(z.any()),
    timestamp: z.number()
  })
]);
export type AGUIEvent = z.infer<typeof AGUIEventSchema>;
