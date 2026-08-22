# Doc Watson

Repository documentation from evidence.

Doc Watson inspects a software repository, decides how much documentation it
has earned, proposes a coherent structure, and helps construct truthful docs
from code, configuration, tests, workflows, releases, and owner input. It is
for maintainers who want useful documentation without generic boilerplate or
confident guesses.

> **Status:** early working product. The standard, workflow, and first
> repository skills are present. The MCP server
> ([#3](https://github.com/dhk/doc-watson/issues/3)) is separate work.

## Why this exists

A repository can contain a great deal of writing and still be poorly
documented when there is no clear way into it. Adding every familiar
open-source document to a small script creates a different problem: maintenance
without reader value.

Doc Watson treats documentation as an evidence and information-architecture
problem. It scales depth to the repository, distinguishes current facts from
proposals, validates executable claims, and records unknowns rather than
completing them with plausible fiction.

## The workflow

```mermaid
flowchart LR
  R[Repository evidence] --> A[Audit]
  A --> P[Proposal]
  P --> D[Owner decision]
  D --> C[Construct]
  C --> V[Verify]
  V --> S[Ship]
  V -->|gaps| Q[Bounded questions]
  Q --> C
```

1. **Audit** the repository, its docs, and its external surfaces.
2. **Propose** a right-sized level and file-level after-state.
3. **Decide** scope with the owner, asking only for facts the repository cannot
   establish.
4. **Construct** documentation from evidence and confirmed owner knowledge.
5. **Verify** commands, links, diagrams, claims, and hygiene.
6. **Ship** an attributable before/after change with gaps preserved.

See the [complete workflow](docs/workflow.md) and [evidence model](docs/evidence.md).

## Documentation levels

| Level | Typical repository | Foundation |
|---|---|---|
| 0 | Personal experiment or script | Purpose, honest status, usage, licence posture |
| 1 | Active early tool or library | Level 0 plus reliable setup, map, limitations, and helpful diagrams |
| 2 | Mature system or service | Level 1 plus architecture, operations, ownership, and triggered decisions |
| 3 | Credible public open source | Level 2 plus public contribution, release, and complete user paths |

Documents are triggered by real needs, not level alone. Runbooks exist because
alerts page someone; governance exists because maintainers share authority;
machine contracts exist because a tool parses the repository.

Read the [versioned standard](docs/standard.md). Starting structures live in
[`templates/`](templates/).

## Architecture

```mermaid
flowchart TB
  O[Maintainer] --> W[Doc Watson workflow]
  W --> ST[Standard and templates]
  W --> SK[Repository skills]
  W --> MCP[MCP server]
  SK --> REPO[Target repository]
  MCP --> REPO
  REPO --> OUT[Audit, proposal, docs, evidence]
  ST --> OUT
  O -->|purpose and meaning| OUT
```

The initial product is optimized for an individual maintainer working
interactively with an agent. Shared team policy and CI enforcement are later
extensions, not prerequisites for a useful first run. See the
[architecture note](docs/architecture.md).

## Skills

| Skill | Current job |
|---|---|
| [`repo-doc-audit`](skills/repo-doc-audit/SKILL.md) | Inspect without changing the target; produce evidence, tier decision, scorecard, and before-state |
| [`repo-doc-propose`](skills/repo-doc-propose/SKILL.md) | Turn accepted findings into a bounded, approval-gated documentation plan |
| [`repo-doc-construct`](skills/repo-doc-construct/SKILL.md) | Implement approved documentation, run authorized checks, and report the before/after delta |

The stages remain separate so inspection does not imply mutation, and a
documentation edit does not imply publication or merge authority.

## Current deliverables

- [repository documentation standard](docs/standard.md);
- [audit-to-ship workflow](docs/workflow.md);
- provenance-preserving [evidence model](docs/evidence.md);
- reusable [document templates](templates/README.md);
- composable [audit](skills/repo-doc-audit/SKILL.md),
  [proposal](skills/repo-doc-propose/SKILL.md), and
  [construction](skills/repo-doc-construct/SKILL.md) skills;
- [prior-art and adaptation record](docs/prior-art.md).

## Contributing

Doc Watson is early. Discuss material changes to the standard, evidence
vocabulary, or public interfaces in an issue first. See
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
