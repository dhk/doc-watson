import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  auditDocumentation,
  constructDocumentation,
  inspectRepository,
  proposeDocumentation,
  verifyDocumentation,
} from "../src/core.js";
import { STANDARD_VERSION } from "../src/types.js";

const temporary: string[] = [];
async function tempRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "doc-watson-"));
  temporary.push(root);
  return root;
}
afterEach(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((entry) => rm(entry, { recursive: true, force: true })),
  );
});

describe("repository inspection", () => {
  it("records evidence without returning document bodies", async () => {
    const root = await tempRoot();
    const repository = path.join(root, "example");
    await mkdir(repository);
    await writeFile(
      path.join(repository, "README.md"),
      "# Private project\nsecret prose\n",
    );
    await writeFile(path.join(repository, ".env"), "TOKEN=do-not-return\n");
    const result = await inspectRepository(repository, {
      repositoryRoots: [root],
      outputRoots: [root],
    });
    expect(result.files).toEqual(["README.md"]);
    expect(result.warnings).toContain("Excluded .env");
    expect(JSON.stringify(result)).not.toContain("secret prose");
    expect(JSON.stringify(result)).not.toContain("do-not-return");
    expect(result.facts[0]?.evidence[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("skips symlinks and rejects paths outside allowed roots", async () => {
    const root = await tempRoot();
    const repository = path.join(root, "example");
    await mkdir(repository);
    await symlink("/etc/passwd", path.join(repository, "outside"));
    const options = { repositoryRoots: [root], outputRoots: [root] };
    const result = await inspectRepository(repository, options);
    expect(result.warnings).toContain("Skipped symbolic link outside");
    await expect(inspectRepository("/", options)).rejects.toMatchObject({
      code: "PATH_NOT_ALLOWED",
    });
  });
});

describe("proposal and construction", () => {
  it("requires approval, preserves provenance, and confines output", async () => {
    const root = await tempRoot();
    const repository = path.join(root, "example");
    await mkdir(repository);
    const options = { repositoryRoots: [root], outputRoots: [root] };
    const proposal = proposeDocumentation(
      await inspectRepository(repository, options),
      1,
    );
    expect(proposal.documents[0]?.claims[0]?.classification).toBe("proposed");
    await expect(
      constructDocumentation(proposal, path.join(root, "unapproved"), options),
    ).rejects.toMatchObject({ code: "PROPOSAL_NOT_APPROVED" });
    const approved = { ...proposal, approved: true as const };
    await expect(
      constructDocumentation(
        approved,
        path.join(os.tmpdir(), "outside-doc-watson"),
        options,
      ),
    ).rejects.toMatchObject({ code: "PATH_NOT_ALLOWED" });
    const output = path.join(root, "generated");
    const manifest = await constructDocumentation(approved, output, options);
    expect(manifest.created[0]?.path).toBe("README.md");
    expect(await readFile(path.join(output, "README.md"), "utf8")).toContain(
      "Documentation required",
    );
    expect(verifyDocumentation(proposal).passed).toBe(true);
  });

  it("rejects traversal before creating output", async () => {
    const root = await tempRoot();
    const proposal = {
      schemaVersion: "1.0" as const,
      standardVersion: STANDARD_VERSION,
      level: 1,
      approved: true,
      documents: [
        {
          path: "../escape.md",
          purpose: "escape",
          content: "bad",
          claims: [
            {
              classification: "proposed" as const,
              summary: "bad",
              evidence: [],
            },
          ],
        },
      ],
      questions: [],
    };
    await expect(
      constructDocumentation(proposal, path.join(root, "generated"), {
        repositoryRoots: [root],
        outputRoots: [root],
      }),
    ).rejects.toBeTruthy();
  });
});

describe("standard alignment", () => {
  const inspection = {
    schemaVersion: "1.0" as const,
    capabilityVersion: "0.1" as const,
    repository: { name: "example" },
    facts: [],
    files: ["README.md"],
    warnings: [],
  };

  it("pins the version stated in docs/standard.md", async () => {
    const standard = await readFile(
      path.join(import.meta.dirname, "../docs/standard.md"),
      "utf8",
    );
    expect(standard).toContain(`**Version:** ${STANDARD_VERSION}\n`);
  });

  it("pins the same version in the published proposal schema", async () => {
    const schema = JSON.parse(
      await readFile(
        path.join(import.meta.dirname, "../schemas/proposal.schema.json"),
        "utf8",
      ),
    );
    expect(schema.properties.standardVersion.const).toBe(STANDARD_VERSION);
  });

  it("requires a licence file only at Level 3", () => {
    const licence = (level: number) =>
      auditDocumentation(inspection, level).findings.find(
        (finding) => finding.path === "LICENSE",
      );
    expect(licence(1)).toMatchObject({ code: "MISSING", severity: "info" });
    expect(licence(3)).toMatchObject({ code: "MISSING", severity: "warning" });
  });
});
