import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkRegression,
  currentStandardVersion,
  latestScorecard,
  parseCsv,
  sweepRepository,
} from "../sweep/check.js";

const root = path.join(import.meta.dirname, "..");
const temporary: string[] = [];
afterEach(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((entry) => rm(entry, { recursive: true, force: true })),
  );
});

async function repo(files: Record<string, string>) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sweep-"));
  temporary.push(directory);
  for (const [relative, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, relative)), {
      recursive: true,
    });
    await writeFile(path.join(directory, relative), text);
  }
  return directory;
}

async function template(standard = currentStandardVersion()) {
  const text = await readFile(
    path.join(root, "templates/doc-watson.template.yml"),
    "utf8",
  );
  return text.replace(/^standard: \S+/m, `standard: ${standard}`);
}

const kinds = (report: ReturnType<typeof sweepRepository>) =>
  report.divergences.map((divergence) => divergence.kind);

const HEADER =
  "concern,applicable,score,max_score,proposed_score,status,evidence,recommendation\n";

describe("sweep checks", () => {
  it("reports an unenrolled repository and nothing else", async () => {
    const report = sweepRepository({
      repo: await repo({ "README.md": "# x\n" }),
    });
    expect(report.enrolled).toBe(false);
    expect(kinds(report)).toEqual(["not-enrolled"]);
  });

  it("passes a clean enrolled repository", async () => {
    const report = sweepRepository({
      repo: await repo({
        ".doc-watson.yml": await template(),
        "README.md": "# x\n",
      }),
    });
    expect(report).toMatchObject({
      enrolled: true,
      onDrift: "issue-and-draft-pr",
    });
    expect(report.divergences).toEqual([]);
  });

  it("flags a stale standard and an unquoted date as not mechanical", async () => {
    const enrollment = (await template("0.1.0")).replace(
      'date: "2026-01-01"',
      "date: 2026-01-01",
    );
    const report = sweepRepository({
      repo: await repo({ ".doc-watson.yml": enrollment, "README.md": "# x\n" }),
    });
    expect(kinds(report)).toEqual(["invalid-enrollment", "stale-standard"]);
    expect(report.divergences[0]?.detail).toMatch(
      /YAML 1\.1: \/last_audit\/date/,
    );
    expect(
      report.divergences.every((divergence) => !divergence.mechanical),
    ).toBe(true);
  });

  it("marks broken links mechanical and credentials not", async () => {
    const report = sweepRepository({
      repo: await repo({
        ".doc-watson.yml": await template(),
        "README.md": "[a](missing.md)\napi_key=q8w7e6r5t4y3u2i1o0p9\n",
      }),
    });
    const hygiene = report.divergences.filter(
      (d) => d.kind === "hygiene-failure",
    );
    expect(hygiene.map((d) => [d.detail.split(": ")[1], d.mechanical])).toEqual(
      [
        ["possible embedded credential", false],
        ["broken link", true],
      ],
    );
  });

  it("detects a score regression against the newest registry entry", async () => {
    const registry = await repo({
      "2026-09-01/scorecard.csv": `${HEADER}truthfulness,yes,1,2,,observed,a,\n`,
      "2026-09-20/scorecard.csv": `${HEADER}truthfulness,yes,2,2,,observed,a,\nlicence,yes,2,2,,observed,"LICENSE, line 1",\noperations,no,,,,,n/a,\n`,
    });
    const current = path.join(registry, "current.csv");
    await writeFile(
      current,
      `${HEADER}truthfulness,yes,1,2,,observed,a,\nlicence,yes,2,2,,observed,b,\noperations,no,,,,,n/a,\n`,
    );
    expect(latestScorecard(registry)).toMatch(/2026-09-20\/scorecard\.csv$/);
    const report = sweepRepository({
      repo: await repo({
        ".doc-watson.yml": await template(),
        "README.md": "# x\n",
      }),
      current,
      registry,
    });
    expect(report.divergences).toEqual([
      { kind: "regression", detail: "truthfulness: 2 → 1", mechanical: false },
    ]);
  });

  it("never compares a just-recorded audit with itself", async () => {
    const registry = await repo({
      "2026-09-20/scorecard.csv": `${HEADER}truthfulness,yes,2,2,,observed,a,\n`,
      "2026-09-27/scorecard.csv": `${HEADER}truthfulness,yes,1,2,,observed,a,\n`,
    });
    const report = sweepRepository({
      repo: await repo({
        ".doc-watson.yml": await template(),
        "README.md": "# x\n",
      }),
      current: path.join(registry, "2026-09-27/scorecard.csv"),
      registry,
    });
    expect(report.divergences).toEqual([
      { kind: "regression", detail: "truthfulness: 2 → 1", mechanical: false },
    ]);
  });

  it("reads quoted CSV fields", () => {
    expect(parseCsv('a,b\n"x, ""y""",2\n')).toEqual([{ a: 'x, "y"', b: "2" }]);
    expect(
      checkRegression(
        `${HEADER}licence,yes,2,2,,,x,\n`,
        `${HEADER}licence,exempt,,,,,x,\n`,
      ),
    ).toEqual([]);
  });
});
