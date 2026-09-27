import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  resolveExistingWithin,
  resolveOutputWithin,
  safeRelativePath,
} from "./paths.js";
import {
  DomainError,
  STANDARD_VERSION,
  inspectionSchema,
  proposalSchema,
  type Inspection,
  type Proposal,
} from "./types.js";

const MAX_FILES = 2_000;
const MAX_FILE_BYTES = 512_000;
const ignoredNames = new Set([
  ".env",
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".DS_Store",
]);
const secretPattern =
  /(?:^|[._-])(secret|credentials?|private[-_]?key)(?:[._-]|$)/i;

export type DomainOptions = {
  repositoryRoots: string[];
  outputRoots: string[];
};

async function listEvidenceFiles(
  root: string,
): Promise<{ files: string[]; warnings: string[] }> {
  const files: string[] = [];
  const warnings: string[] = [];
  async function walk(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute);
      if (ignoredNames.has(entry.name) || secretPattern.test(entry.name)) {
        warnings.push(`Excluded ${relative}`);
        continue;
      }
      if (entry.isSymbolicLink()) {
        warnings.push(`Skipped symbolic link ${relative}`);
        continue;
      }
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) {
        if (files.length >= MAX_FILES) {
          throw new DomainError(
            "LIMIT_EXCEEDED",
            `Repository exceeds ${MAX_FILES} files`,
          );
        }
        const size = (await stat(absolute)).size;
        if (size > MAX_FILE_BYTES)
          warnings.push(`Skipped oversized file ${relative}`);
        else files.push(relative);
      }
    }
  }
  await walk(root);
  return { files: files.sort(), warnings: warnings.sort() };
}

export async function inspectRepository(
  repositoryPath: string,
  options: DomainOptions,
): Promise<Inspection> {
  const root = await resolveExistingWithin(
    repositoryPath,
    options.repositoryRoots,
  );
  const rootStat = await stat(root);
  if (!rootStat.isDirectory())
    throw new DomainError("NOT_A_REPOSITORY", "Path is not a directory");
  const { files, warnings } = await listEvidenceFiles(root);
  const facts: Inspection["facts"] = [];
  for (const candidate of [
    "README.md",
    "package.json",
    "pyproject.toml",
    "LICENSE",
  ]) {
    if (!files.includes(candidate)) continue;
    const body = await readFile(path.join(root, candidate));
    facts.push({
      classification: "observed",
      summary: `${candidate} is present`,
      evidence: [
        {
          kind: "file",
          path: candidate,
          sha256: createHash("sha256").update(body).digest("hex"),
        },
      ],
    });
  }
  return inspectionSchema.parse({
    schemaVersion: "1.0",
    capabilityVersion: "0.1",
    repository: { name: path.basename(root) },
    facts,
    files,
    warnings,
  });
}

export function auditDocumentation(inspection: Inspection, level = 1) {
  inspectionSchema.parse(inspection);
  // docs/standard.md requires a README at every level, but a licence file only
  // at Level 3; below that an explicit licence posture (e.g. in the README) is
  // enough, which this file-presence check cannot see.
  const checks = [
    { path: "README.md", required: true },
    { path: "LICENSE", required: level >= 3 },
  ];
  const findings = checks.map(({ path: documentPath, required }) => {
    const present = inspection.files.includes(documentPath);
    return {
      code: present ? "PRESENT" : "MISSING",
      severity: present || !required ? "info" : "warning",
      path: documentPath,
    };
  });
  return {
    schemaVersion: "1.0",
    standardVersion: STANDARD_VERSION,
    level,
    findings,
  };
}

export function proposeDocumentation(
  inspection: Inspection,
  level = 1,
): Proposal {
  inspectionSchema.parse(inspection);
  const hasReadme = inspection.files.includes("README.md");
  return proposalSchema.parse({
    schemaVersion: "1.0",
    standardVersion: STANDARD_VERSION,
    level,
    approved: false,
    documents: hasReadme
      ? []
      : [
          {
            path: "README.md",
            purpose:
              "Explain what the repository is, why it matters, and how to start.",
            content:
              "# Documentation required\n\nThis draft requires owner input before publication.\n",
            claims: [
              {
                classification: "proposed",
                summary: "Add a repository README",
                evidence: [],
              },
            ],
          },
        ],
    questions: ["Who is this repository for?", "What works today?"],
  });
}

export async function constructDocumentation(
  proposalInput: Proposal,
  outputPath: string,
  options: DomainOptions,
) {
  const proposal = proposalSchema.parse(proposalInput);
  if (!proposal.approved) {
    throw new DomainError(
      "PROPOSAL_NOT_APPROVED",
      "Proposal must be explicitly approved",
    );
  }
  const output = await resolveOutputWithin(outputPath, options.outputRoots);
  const documents = proposal.documents.map((document) => ({
    ...document,
    relative: safeRelativePath(document.path),
  }));
  const manifest: Array<{ path: string; sha256: string }> = [];
  try {
    await mkdir(output, { recursive: false });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new DomainError("OUTPUT_EXISTS", "Output path already exists");
    }
    throw error;
  }
  try {
    for (const document of documents) {
      const target = path.join(output, document.relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, document.content, { flag: "wx" });
      manifest.push({
        path: document.relative,
        sha256: createHash("sha256").update(document.content).digest("hex"),
      });
    }
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  }
  return { schemaVersion: "1.0", outputPath: output, created: manifest };
}

export function verifyDocumentation(proposalInput: Proposal) {
  const proposal = proposalSchema.parse(proposalInput);
  const results = proposal.documents.map((document) => ({
    path: document.path,
    checks: [
      { code: "NON_EMPTY", passed: document.content.trim().length > 0 },
      { code: "HAS_PROVENANCE", passed: document.claims.length > 0 },
    ],
  }));
  return {
    schemaVersion: "1.0",
    passed: results.every((result) =>
      result.checks.every((check) => check.passed),
    ),
    results,
  };
}
