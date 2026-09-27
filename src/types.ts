import { z } from "zod";

/** Must equal the **Version:** line of docs/standard.md. */
export const STANDARD_VERSION = "0.2.0";

export const provenanceClassification = z.enum([
  "observed",
  "verified",
  "declared",
  "proposed",
  "unknown",
]);

export const evidenceSchema = z.object({
  kind: z.enum(["file", "command", "owner"]),
  path: z.string().optional(),
  startLine: z.number().int().positive().optional(),
  endLine: z.number().int().positive().optional(),
  sha256: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  excerpt: z.string().optional(),
  check: z.string().optional(),
});

export const claimSchema = z.object({
  classification: provenanceClassification,
  summary: z.string().min(1),
  evidence: z.array(evidenceSchema).default([]),
});

export const inspectionSchema = z.object({
  schemaVersion: z.literal("1.0"),
  capabilityVersion: z.literal("0.1"),
  repository: z.object({
    name: z.string().min(1),
    head: z.string().optional(),
  }),
  facts: z.array(claimSchema),
  files: z.array(z.string()),
  warnings: z.array(z.string()),
});

export const proposalSchema = z.object({
  schemaVersion: z.literal("1.0"),
  standardVersion: z.literal(STANDARD_VERSION),
  level: z.number().int().min(0).max(3),
  approved: z.boolean().default(false),
  documents: z.array(
    z.object({
      path: z.string().min(1),
      purpose: z.string().min(1),
      content: z.string(),
      claims: z.array(claimSchema),
    }),
  ),
  questions: z.array(z.string()),
});

export type Inspection = z.infer<typeof inspectionSchema>;
export type Proposal = z.infer<typeof proposalSchema>;

export type ToolFailure = {
  ok: false;
  error: { code: ErrorCode; message: string };
};

export type ErrorCode =
  | "INVALID_INPUT"
  | "PATH_NOT_ALLOWED"
  | "NOT_A_REPOSITORY"
  | "PROPOSAL_NOT_APPROVED"
  | "OUTPUT_EXISTS"
  | "LIMIT_EXCEEDED"
  | "IO_ERROR";

export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}
