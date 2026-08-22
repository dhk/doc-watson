#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  auditDocumentation,
  constructDocumentation,
  inspectRepository,
  proposeDocumentation,
  verifyDocumentation,
  type DomainOptions,
} from "./core.js";
import { DomainError, inspectionSchema, proposalSchema } from "./types.js";

function configuredRoots(name: string): string[] {
  return (process.env[name] ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .filter(Boolean);
}

function response(value: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
  };
}

function failure(error: unknown) {
  const domain =
    error instanceof DomainError
      ? error
      : error instanceof z.ZodError
        ? new DomainError(
            "INVALID_INPUT",
            "Input did not match the tool contract",
          )
        : new DomainError("IO_ERROR", "Operation failed");
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({
          ok: false,
          error: { code: domain.code, message: domain.message },
        }),
      },
    ],
  };
}

export function createServer(options: DomainOptions) {
  const server = new McpServer({ name: "doc-watson", version: "0.1.0" });
  server.registerTool(
    "inspect_repository",
    { inputSchema: { repositoryPath: z.string() } },
    async ({ repositoryPath }) => {
      try {
        return response(await inspectRepository(repositoryPath, options));
      } catch (error) {
        return failure(error);
      }
    },
  );
  server.registerTool(
    "audit_documentation",
    {
      inputSchema: {
        inspection: inspectionSchema,
        level: z.number().int().min(0).max(3).default(1),
      },
    },
    async ({ inspection, level }) =>
      response(auditDocumentation(inspection, level)),
  );
  server.registerTool(
    "propose_documentation",
    {
      inputSchema: {
        inspection: inspectionSchema,
        level: z.number().int().min(0).max(3).default(1),
      },
    },
    async ({ inspection, level }) =>
      response(proposeDocumentation(inspection, level)),
  );
  server.registerTool(
    "construct_documentation",
    { inputSchema: { proposal: proposalSchema, outputPath: z.string() } },
    async ({ proposal, outputPath }) => {
      try {
        return response(
          await constructDocumentation(proposal, outputPath, options),
        );
      } catch (error) {
        return failure(error);
      }
    },
  );
  server.registerTool(
    "verify_documentation",
    { inputSchema: { proposal: proposalSchema } },
    async ({ proposal }) => response(verifyDocumentation(proposal)),
  );
  return server;
}

async function main() {
  const options = {
    repositoryRoots: configuredRoots("DOC_WATSON_REPOSITORY_ROOTS"),
    outputRoots: configuredRoots("DOC_WATSON_OUTPUT_ROOTS"),
  };
  if (
    options.repositoryRoots.length === 0 ||
    options.outputRoots.length === 0
  ) {
    process.stderr.write(
      "DOC_WATSON_REPOSITORY_ROOTS and DOC_WATSON_OUTPUT_ROOTS are required\n",
    );
    process.exitCode = 2;
    return;
  }
  const server = createServer(options);
  await server.connect(new StdioServerTransport());
}

if (import.meta.url === `file://${process.argv[1]}`) void main();
