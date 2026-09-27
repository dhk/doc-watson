---
name: repo-doc-audit
description: Audit a repository's documentation against its actual code, configuration, workflows, and maturity. Use when Codex needs to assess documentation quality, assign a Doc Watson level, find stale or duplicated docs, identify missing install or architecture guidance, produce a scorecard, or capture before-state evidence without changing the repository.
---

# Repository documentation audit

Audit before proposing or writing. Treat repository evidence as authoritative and documentation claims as assertions to verify.

## Workflow

1. Establish the repository boundary, audience, lifecycle, distribution method, and whether it is public, internal, operated, or archival. If the repository has a `.doc-watson.yml`, treat its level, audience, trigger decisions, and exemptions as `declared` facts: audit against them, and report evidence that contradicts one as a question for the owner rather than overriding it.
2. Run `python3 <this skill's directory>/scripts/inventory.py REPOSITORY` (the script ships with this skill; it is not in the audited repository) and capture stdout through the calling harness. If a file is required, pass `--output` with a path in an external artifact directory; the script rejects paths inside the audited repository. Inspect its output; do not treat presence as quality.
3. Read the root docs, manifests, entry points, examples, tests, CI, deployment configuration, security-sensitive paths, and recent release metadata.
4. Read [rubric.md](references/rubric.md), select the smallest justified level, and apply every trigger independently.
5. Label every material statement using [provenance.md](references/provenance.md). Never upgrade inference to fact.
6. Check truthfulness, runnable installation, first success, user value, architecture, privacy/security boundaries, maintenance, navigation, duplication, stale material, and broken internal links.
7. Read [artifacts.md](references/artifacts.md), then produce `audit.md`, `scorecard.csv`, `evidence.json`, and an exact or commit-pinned before-state. Do not edit product documentation during an audit-only request.

## Guardrails

- Keep inspection read-only unless the user separately authorizes changes.
- Do not execute commands that mutate external systems, production, user data, credentials, billing, or repositories.
- Prefer static inspection. If local verification is authorized, start with help, dry-run, lint, or isolated tests.
- Record secrets only as `present`, `absent`, or `unknown`; never copy values.
- Mark claims `observed`, `verified`, `declared`, `proposed`, or `unknown`.
- Ask one focused question when an unanswered fact materially changes the level or recommendation. Continue with explicitly marked unknowns otherwise.
- Recommend omission when a document has no trigger. More files are not inherently more mature.

## Audit output

Lead with the level decision and why. For each finding include impact, evidence location, provenance, and recommended disposition. Separate current capability from planned capability. End with the smallest credible next step and unresolved owner questions.

Use `$repo-doc-propose` only after the audit is accepted or the user explicitly asks for a proposal.

For Doc Watson project context, see [foundation #1](https://github.com/dhk/doc-watson/issues/1) and [MCP interface #3](https://github.com/dhk/doc-watson/issues/3).
