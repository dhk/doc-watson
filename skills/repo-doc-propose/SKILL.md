---
name: repo-doc-propose
description: Turn an evidence-backed repository documentation audit into a right-sized proposed information architecture and implementation plan. Use when Codex needs to propose documentation files, compare internal and handover options, decide what to merge or remove, define diagrams and install paths, or draft an issue without implementing changes.
---

# Repository documentation proposal

Translate findings into the smallest structure that satisfies the justified tier. Do not generate finished docs in this phase.

## Inputs

Require an audit or reconstruct equivalent evidence. Read [proposal-contract.md](references/proposal-contract.md). If the target is being sold or handed over, also read [handover.md](references/handover.md).

## Workflow

1. Restate the audience, tier, maturity, live capabilities, risks, and unknowns.
2. Map each audit finding to keep, revise, add, merge, move, or retire.
3. Apply trigger rules. Reject ceremonial files that lack a real consumer.
4. Design one canonical location per fact; make secondary files link to it.
5. Specify the shortest truthful quickstart plus published, direct-download/`curl`, and careful paths only where those paths actually exist or are explicitly proposed.
6. Specify diagrams by question answered: “So what?” covers user, need, value, and outcome; architecture covers boundaries, inputs, transformations, outputs, external systems, and trust boundaries.
7. Preserve provenance for every proposed claim and identify the evidence needed to promote `unknown` or `proposed` claims.
8. Present alternatives only when they change scope or audience materially. For a sale candidate, separate internal baseline from handover readiness.
9. Produce an issue-ready plan with acceptance criteria, validation, exclusions, dependencies, and links to related work.

## Approval boundary

Proposal authority does not imply implementation, publishing, repository visibility changes, archival, release, or merge authority. State the next approval needed. Never close an unknown by inventing content.

Use `$repo-doc-construct` only after the proposal or scope has been approved.

For Doc Watson project context, see [foundation #1](https://github.com/dhk/doc-watson/issues/1) and [MCP interface #3](https://github.com/dhk/doc-watson/issues/3).
