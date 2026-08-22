# Agent instructions

## Purpose

Doc Watson turns repository evidence and bounded owner input into right-sized,
truthful documentation. The foundation docs and repository skills are the
current product surface; an MCP server is separate work in issue #3. Optimize
the initial workflow for an individual maintainer working interactively with
an agent. Treat team policy and CI enforcement as later extensions.

## Start every task

1. Read `README.md` and `docs/README.md`.
2. Identify whether the change affects the standard, workflow, a template, or
   an implementation surface.
3. Trace material claims to repository evidence or a recorded owner declaration.
4. Preserve the vocabulary in `docs/evidence.md`.

## Invariants

- Never present proposed or unverified behavior as working.
- Do not manufacture purpose, rationale, policy, ownership, or operations.
- Choose documents through trigger rules, not a universal checklist.
- Keep mutable facts in one canonical place and link elsewhere.
- Ask owner-only questions one at a time and retain the answer's provenance.
- A template is not completion evidence.

## Documentation changes

- Update `docs/README.md` when durable docs move or change.
- Version normative changes in `docs/standard.md`.
- Keep templates aligned without copying explanatory prose everywhere.
- Preserve attribution in `docs/prior-art.md`.
- Use ADRs only for actual decisions with alternatives and consequences.

All work goes through an issue, focused branch, and pull request. Pull requests
name their evidence, validation, unknowns, and linked issue.
