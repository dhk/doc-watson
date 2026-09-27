# Repository documentation standard

**Version:** 0.3.0

**Status:** Draft

**Last updated:** 2026-09-27

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

## Scoring

An audit scores each concern that applies at the selected level or through a
trigger rule:

| Score | Meaning |
|---|---|
| 0 | Absent |
| 1 | Partial or stale |
| 2 | Fit for purpose |
| n/a | Not required at this level and no trigger applies |

Record n/a separately from 0. Never award points for a document nothing
requires; more files are not more maturity.

### Audit concerns

1. Purpose and audience
2. Status and limits
3. Value (“so what”)
4. First success
5. Install paths
6. Usage
7. Architecture
8. Data, privacy, and security
9. Operations
10. Ownership and contribution
11. Licence
12. Decisions
13. Agent memory
14. Machine contracts
15. Navigation
16. Truthfulness
17. Hygiene and duplication
18. Maintenance and verification

Every row of the levels table maps to at least one concern; the README row
maps to purpose and audience, first success, and navigation. Truthfulness,
hygiene, and maintenance apply at every level.

## Minimum audit output

- target repository and revision;
- selected level and rationale;
- evidence inventory and important absences;
- findings for applicable purpose, status, setup, usage, architecture, safety,
  ownership, and hygiene concerns;
- current and proposed scorecard, using the scale above;
- file-level proposal with deliberate omissions;
- bounded unknowns and validation limits.

See [`workflow.md`](workflow.md).

## Enrollment

A repository is under Doc Watson's control when it has a `.doc-watson.yml`
file at its root. The file records what only the owner can declare (level,
audience, which triggers apply, deliberate exemptions) and which audit it was
last measured by. It never records scores; audits hold those.

The file must validate against
[`schemas/enrollment.schema.json`](../schemas/enrollment.schema.json). Start
from [`templates/doc-watson.template.yml`](../templates/doc-watson.template.yml).

| Field | Meaning |
|---|---|
| `schema` | Enrollment format version; currently `1`. |
| `standard` | Standard version the repository was last audited against. |
| `level` | Owner-declared level, 0–3. |
| `audience` | Who the documentation serves, in one line. |
| `triggers` | For every trigger ID below: `applies` (true or false) and a `reason`. |
| `exemptions` | Concerns deliberately not met, each with a concern ID, a `reason`, and an optional `review_by` date. |
| `last_audit` | `revision`, `date`, and `record` (where the audit is kept) of the latest audit. |
| `on_drift` | What a sweep may do: `issue-and-draft-pr`, `issue`, or `report`. |

Every trigger rule has one ID, in the order of the trigger rules above:

| ID | Trigger rule |
|---|---|
| `install-guide` | Install guide |
| `user-guides` | User guides |
| `architecture` | Architecture |
| `adrs` | ADRs |
| `agent-memory` | Agent memory |
| `machine-contracts` | Machine contracts |
| `codeowners` | CODEOWNERS |
| `contributing` | CONTRIBUTING |
| `governance` | Governance |
| `roadmap` | Roadmap |
| `runbooks` | Runbooks |
| `handover` | Handover docs |

A concern ID is the concern's name from the audit concern list, lowercased,
with every run of other characters replaced by one hyphen:
`value-so-what`, `data-privacy-and-security`,
`ownership-and-contribution`.

Rules:

1. Level, audience, trigger decisions, and exemptions are **declared** facts.
   Tools may question them; only the owner changes them.
2. An exemption must name its reason. Truthfulness, hygiene and duplication,
   and maintenance and verification cannot be exempted.
3. An exempt concern is scored n/a, and the audit lists the exemption.

### Divergence

An enrolled repository has diverged when any of these holds:

1. **Stale standard:** `standard` is older than the current standard version.
2. **Regression:** an applicable concern scores lower than in the last audit.
3. **Hygiene failure:** a hygiene check fails, such as a broken link or an
   embedded credential.
4. **Contradicted declaration:** repository evidence contradicts a declared
   fact, for example `contributing` is declared not to apply while the README
   invites outside contributions.
5. **Invalid enrollment:** the file is missing a field or fails the schema.

A contradicted declaration is a question for the owner, never something a tool
fixes. The periodic sweep that detects divergence is specified in
[`sweep.md`](sweep.md).

## Changelog

### 0.3.0 — 2026-09-27

- Added enrollment: the `.doc-watson.yml` file, its schema and template,
  stable IDs for trigger rules and concerns, exemption rules, and the
  definition of divergence.

### 0.2.0 — 2026-09-27

- Made the scoring scale and audit concern list normative here. Before this,
  the audit template carried a seven-row list and the proposed audit skill
  (#2) a different one.
- Added decisions and agent memory as scored concerns so every levels-table
  row can be scored.

### 0.1.0 — 2026-08-22

- Established four levels and need-based trigger rules.
- Added installation paths, evidence vocabulary, diagrams, hygiene, audit
  outputs, and handover concerns.
- Consolidated the DHK Labs brief and audit case studies into one authority.
