/**
 * Deterministic divergence checks for one enrolled repository.
 *
 * Covers every divergence rule in docs/standard.md that needs no judgement:
 * invalid enrollment, stale standard, hygiene failures, and score regression
 * against a previous scorecard. Contradicted declarations need an agent
 * audit (repo-doc-audit); the routine adds them from the audit, so this
 * script never emits that kind. An unenrolled repository is not a
 * divergence: the report says enrolled: false and the sweep skips it.
 *
 * Usage:
 *   npm run sweep:check -- --repo <checkout> [--current <scorecard.csv>] [--previous <scorecard.csv> | --registry <audits/owner/repo>]
 * Exit codes: 0 no divergence (or not enrolled), 1 divergence, 2 usage or environment error.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { parse } from "yaml";

export const DOC_WATSON_ROOT = path.join(import.meta.dirname, "..");

export type DivergenceKind =
  | "invalid-enrollment"
  | "stale-standard"
  | "hygiene-failure"
  | "regression"
  /** From the agent audit, never from this script. */
  | "contradicted-declaration";

export type Divergence = {
  kind: DivergenceKind;
  detail: string;
  /** True only when the evidence alone settles the fix (docs/sweep.md). */
  mechanical: boolean;
};

export type Report = {
  repository: string;
  enrolled: boolean;
  onDrift: string | null;
  /** The scorecard compared against, or why regression was not assessed. */
  regression:
    { assessed: true; previous: string } | { assessed: false; reason: string };
  divergences: Divergence[];
};

export function currentStandardVersion(root = DOC_WATSON_ROOT): string {
  const standard = readFileSync(path.join(root, "docs/standard.md"), "utf8");
  const match = /^\*\*Version:\*\* (\d+\.\d+\.\d+)$/m.exec(standard);
  if (!match?.[1]) throw new Error("docs/standard.md has no Version line");
  return match[1];
}

function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export function checkEnrollment(
  repo: string,
  root = DOC_WATSON_ROOT,
): { enrolled: boolean; onDrift: string | null; divergences: Divergence[] } {
  const file = path.join(repo, ".doc-watson.yml");
  if (!existsSync(file)) {
    return { enrolled: false, onDrift: null, divergences: [] };
  }
  const schema = JSON.parse(
    readFileSync(path.join(root, "schemas/enrollment.schema.json"), "utf8"),
  );
  const validate = new Ajv2020({ allErrors: true }).compile(schema);
  const text = readFileSync(file, "utf8");
  const divergences: Divergence[] = [];
  let enrollment: Record<string, unknown> | null = null;
  // YAML 1.2 is what the schema is written against; YAML 1.1 catches
  // unquoted dates and hashes that other parsers would read as non-strings.
  for (const version of ["1.2", "1.1"] as const) {
    let parsed: unknown;
    try {
      parsed = parse(text, { version });
    } catch (error) {
      divergences.push({
        kind: "invalid-enrollment",
        detail: `YAML ${version}: ${(error as Error).message.split("\n")[0]}`,
        mechanical: false,
      });
      continue;
    }
    if (version === "1.2" && parsed && typeof parsed === "object") {
      enrollment = parsed as Record<string, unknown>;
    }
    if (!validate(parsed)) {
      const errors = (validate.errors ?? [])
        .map((error) => `${error.instancePath || "/"} ${error.message}`)
        .join("; ");
      divergences.push({
        kind: "invalid-enrollment",
        detail: `YAML ${version}: ${errors}`,
        mechanical: false,
      });
    }
  }
  const declared = enrollment?.["standard"];
  if (typeof declared === "string" && /^\d+\.\d+\.\d+$/.test(declared)) {
    const current = currentStandardVersion(root);
    if (compareVersions(declared, current) < 0) {
      divergences.push({
        kind: "stale-standard",
        detail: `declared ${declared}, current ${current}`,
        mechanical: false,
      });
    }
  }
  const onDrift = enrollment?.["on_drift"];
  return {
    enrolled: true,
    onDrift: typeof onDrift === "string" ? onDrift : null,
    divergences,
  };
}

export function checkHygiene(
  repo: string,
  root = DOC_WATSON_ROOT,
): Divergence[] {
  const script = path.join(
    root,
    "skills/repo-doc-construct/scripts/check_docs.py",
  );
  const result = spawnSync("python3", [script, repo], { encoding: "utf8" });
  if (result.error || result.status === null || result.status > 1) {
    throw new Error(
      `check_docs.py could not run: ${result.error?.message ?? result.stderr.trim() ?? `status ${result.status}`}`,
    );
  }
  if (result.status === 0) return [];
  const lines = `${result.stdout}${result.stderr}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((line) => ({
    kind: "hygiene-failure" as const,
    detail: line,
    // A broken link or anchor is settled by the evidence; a possible
    // credential is a security matter for the owner, never a pull request.
    mechanical: /: broken (link|anchor): /.test(line),
  }));
}

/** Minimal RFC 4180 reader: quoted fields may hold commas, quotes and newlines. */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += char;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((cells) => cells.some((cell) => cell));
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((name, index) => [name, cells[index] ?? ""])),
  );
}

function scores(csv: string): Map<string, number> {
  const result = new Map<string, number>();
  for (const row of parseCsv(csv)) {
    const concern = row["concern"];
    const score = row["score"];
    if (concern && row["applicable"] === "yes" && /^[012]$/.test(score ?? "")) {
      result.set(concern, Number(score));
    }
  }
  return result;
}

export function checkRegression(
  previousCsv: string,
  currentCsv: string,
): Divergence[] {
  const before = scores(previousCsv);
  const after = scores(currentCsv);
  const divergences: Divergence[] = [];
  for (const [concern, previous] of before) {
    const current = after.get(concern);
    if (current !== undefined && current < previous) {
      divergences.push({
        kind: "regression",
        detail: `${concern}: ${previous} → ${current}`,
        mechanical: false,
      });
    }
  }
  return divergences;
}

/**
 * The newest dated audit under a registry directory that has a scorecard,
 * skipping `exclude` so a just-written audit is never compared with itself.
 */
export function latestScorecard(
  registryDirectory: string,
  exclude?: string,
): string | null {
  if (!existsSync(registryDirectory)) return null;
  const skip = exclude ? path.resolve(exclude) : null;
  const dated = readdirSync(registryDirectory)
    .filter((name) => /^\d{4}-\d{2}-\d{2}/.test(name))
    .sort()
    .reverse();
  for (const name of dated) {
    const candidate = path.join(registryDirectory, name, "scorecard.csv");
    if (existsSync(candidate) && path.resolve(candidate) !== skip) {
      return candidate;
    }
  }
  return null;
}

export function sweepRepository(options: {
  repo: string;
  current?: string;
  previous?: string;
  registry?: string;
  root?: string;
}): Report {
  const root = options.root ?? DOC_WATSON_ROOT;
  const enrollment = checkEnrollment(options.repo, root);
  const divergences = [...enrollment.divergences];
  let regression: Report["regression"] = {
    assessed: false,
    reason: "not enrolled",
  };
  if (enrollment.enrolled) {
    divergences.push(...checkHygiene(options.repo, root));
    const previous =
      options.previous ??
      (options.registry
        ? latestScorecard(options.registry, options.current)
        : null);
    if (!options.current) {
      regression = { assessed: false, reason: "no --current scorecard" };
    } else if (!previous) {
      regression = { assessed: false, reason: "no previous scorecard" };
    } else {
      regression = { assessed: true, previous: path.resolve(previous) };
      divergences.push(
        ...checkRegression(
          readFileSync(previous, "utf8"),
          readFileSync(options.current, "utf8"),
        ),
      );
    }
  }
  return {
    repository: path.resolve(options.repo),
    enrolled: enrollment.enrolled,
    onDrift: enrollment.onDrift,
    regression,
    divergences,
  };
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const repo = argument("repo");
  if (!repo) {
    process.stderr.write(
      "usage: sweep:check -- --repo <checkout> [--current <csv>] [--previous <csv> | --registry <dir>]\n",
    );
    process.exit(2);
  }
  const options: Parameters<typeof sweepRepository>[0] = { repo };
  for (const key of ["current", "previous", "registry"] as const) {
    const value = argument(key);
    if (value) options[key] = value;
  }
  try {
    const report = sweepRepository(options);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    process.exit(report.divergences.length === 0 ? 0 : 1);
  } catch (error) {
    process.stderr.write(`sweep:check: ${(error as Error).message}\n`);
    process.exit(2);
  }
}
