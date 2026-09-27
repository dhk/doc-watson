# Level and audit rubric

Condensed from Doc Watson standard 0.2.0 (`docs/standard.md` in
[dhk/doc-watson](https://github.com/dhk/doc-watson)). The standard is the
authority; this copy exists so the skill works when installed on its own.
`tests/test_rubric_sync.py` fails when the levels table, trigger rules,
scoring scale, or concern list drift from it.

Choose by repository need, not prestige. Typical repositories: Level 0 an
experiment, personal script, or archive; Level 1 an active early tool or
library; Level 2 a mature system or service; Level 3 credible public OSS with
outside consumers.

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
typical row.

## Trigger rules

Apply these independently of the level:

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

## Scoring

Score each concern that applies at the selected level or through a trigger:

| Score | Meaning |
|---|---|
| 0 | Absent |
| 1 | Partial or stale |
| 2 | Fit for purpose |
| n/a | Not required at this level and no trigger applies |

Record n/a separately from 0. Never award points for a document nothing
requires.

## Audit concerns

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
