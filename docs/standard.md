# Repository documentation standard

**Version:** 0.1.0

**Status:** Draft

**Last updated:** 2026-08-22

“Must” is a requirement for the selected level or applicable trigger. “Should”
is the default unless repository evidence supports an exception.

## Principles

1. Depth scales with repository type, audience, risk, and operations.
2. The README is a front door: purpose, status, first use, and deeper paths.
3. Readers can distinguish current behavior from proposals.
4. Executable claims are verified or labelled unverified.
5. Architecture explains the mental model and “so what,” not every class.
6. Mutable facts have one authority; other documents link.
7. Unknown organizational knowledge remains a gap until confirmed.
8. Removing stale or duplicative material is documentation work.

## Levels

| Concern | Level 0 — experiment | Level 1 — active early | Level 2 — mature system | Level 3 — public OSS |
|---|---|---|---|---|
| README | Minimal | Standard | Standard | Public-facing |
| Licence posture | Explicit | Explicit | Explicit | Licence file required |
| Install | One truthful path | Reliable common path | Complete supported paths | Published, direct/source, careful paths where available |
| Usage | One example | First successful outcome | Core workflows | User guides and examples |
| Status and limits | Required | Required | Required | Required, including support posture |
| Repository map | If non-obvious | If multi-part | Required | Required |
| “So what” | One sentence | Required | Required | Required |
| Architecture | If helpful | One useful context/flow | Context and containers | As needed; avoid code mirrors |
| Security/privacy | Risks named | Data, credentials, permissions, side effects | Policy and operating boundaries | Public reporting and support posture |
| Ownership/contribution | Not normally | When others participate | Ownership required | Contribution path required |
| Operations | Not normally | For real operational needs | Deployment/recovery; triggered runbooks | For hosted surfaces |
| Decisions | Not normally | For a real tradeoff | Major ADRs | Major ADRs |
| Machine contract | If parsed | If parsed | If API/schema exists | If applicable |
| Agent memory | If agents return | If agents return | If agents return | If agents return |

Levels are baselines, not cumulative bureaucracy. Triggered needs override the
typical row: a Level 1 credential-handling tool may require stronger security
guidance than a Level 3 static library.

## Trigger rules

- Add an install guide when there is more than one supported path or setup no
  longer fits a reliable README section.
- Add user guides when first success or common tasks require more than a compact example.
- Add architecture when the mental model is not clear from one repository read.
- Add ADRs only for decisions with real alternatives and consequences.
- Add agent memory when an agent returns across sessions; keep it current.
- Add machine contracts only when a program parses the repository or interface.
- Add CODEOWNERS when ownership or review routing is shared.
- Add CONTRIBUTING when people outside maintainers are invited to make changes.
- Add governance when multiple maintainers have authority questions.
- Add a Now/Next/Later roadmap when a public audience needs direction.
- Add runbooks only when alerts page someone; include owner, trigger,
  last-verified date, fallback, escalation, and rollback.
- Add handover docs when another party must operate the asset independently.

## README contract

A README answers, at appropriate depth:

- What is this, who is it for, and why does it matter?
- What works now, and what is planned or unsupported?
- How does a reader reach the first successful outcome?
- Where are deeper guides, reference, architecture, and operations?
- What are the licence and contribution expectations?

Prefer title, short description, status, quickstart, usage, and deeper links.
Avoid badge walls, long background essays, and duplicated reference.

## Installation contract

Document only supported paths, each separately:

1. **Published:** package manager or release artifact.
2. **Direct:** pinned download or `curl` path when safe and supported.
3. **Careful:** download, inspect, configure, run, and verify step by step.
4. **Source:** clone, dependencies, build, and verification.

Do not invent routes to fill the matrix. Explain credentials and external side
effects before the first command that can cause them.

## Information architecture

Use the [Diátaxis](https://diataxis.fr/) distinction: tutorial for learning,
how-to for a real task, reference for facts, explanation for mental models and
rationale. Small repos may use `docs/guide/` and `docs/reference/`; add
architecture, ADR, or runbook folders only when earned. Index multi-page trees.

## Diagrams

Use diagrams when relationships or flows become clearer than prose. Prefer
Mermaid for reviewable source. A “so what” diagram shows how the user's
situation changes. Context shows users and external systems; containers show
major boundaries; sequence diagrams show meaningful flows. Avoid code-level
diagrams that drift. Explain each diagram's consequence in prose.

## Evidence and truthfulness

Use [`evidence.md`](evidence.md): **observed**, **verified**, **declared**,
**proposed**, and **unknown**. A manifest-derived command is observed, not
verified. Purpose generally requires owner declaration. Rationale cannot be
inferred from layout. Every audit records revision and standard version.

## Hygiene

Every pass checks for duplicate or superseded drafts; closed process artifacts;
stale session or generated files; incomplete indexes; broken links;
contradictory install, version, privacy, or status claims; machine-specific
paths; private example data; repeated generated reference; and doc debt that
was recorded but never closed.

Prefer deletion, consolidation, relocation, or an archival notice when a
repository or document lacks a coherent continuing purpose.

## Minimum audit output

- target repository and revision;
- selected level and rationale;
- evidence inventory and important absences;
- findings for applicable purpose, status, setup, usage, architecture, safety,
  ownership, and hygiene concerns;
- current and proposed scorecard;
- file-level proposal with deliberate omissions;
- bounded unknowns and validation limits.

See [`workflow.md`](workflow.md).

## Changelog

### 0.1.0 — 2026-08-22

- Established four levels and need-based trigger rules.
- Added installation paths, evidence vocabulary, diagrams, hygiene, audit
  outputs, and handover concerns.
- Consolidated the DHK Labs brief and audit case studies into one authority.
