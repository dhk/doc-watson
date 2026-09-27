import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createServer } from "../src/server.js";

describe("MCP integration", () => {
  it("lists tools and performs a read-only fixture inspection", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "doc-watson-mcp-"));
    const repository = path.join(root, "fixture");
    await mkdir(repository);
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    const server = createServer({
      repositoryRoots: [root],
      outputRoots: [root],
    });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual([
      "inspect_repository",
      "audit_documentation",
      "propose_documentation",
      "construct_documentation",
      "verify_documentation",
    ]);
    const inspected = await client.callTool({
      name: "inspect_repository",
      arguments: { repositoryPath: repository },
    });
    expect(inspected.isError).not.toBe(true);
    if (!Array.isArray(inspected.content))
      throw new Error("Inspection did not return content");
    const text = inspected.content.find(
      (item): item is { type: "text"; text: string } =>
        typeof item === "object" &&
        item !== null &&
        "type" in item &&
        item.type === "text" &&
        "text" in item &&
        typeof item.text === "string",
    );
    if (!text) throw new Error("Inspection did not return text");
    const audit = await client.callTool({
      name: "audit_documentation",
      arguments: { inspection: JSON.parse(text.text), level: 1 },
    });
    expect(audit.isError).not.toBe(true);
    expect(JSON.stringify(audit.content)).toContain("MISSING");
    await client.close();
    await server.close();
    await rm(root, { recursive: true, force: true });
  });
});
