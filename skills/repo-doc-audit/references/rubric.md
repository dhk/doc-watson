# Level and audit rubric

Condensed from Doc Watson standard 0.2.0 (`docs/standard.md` in
[dhk/doc-watson](https://github.com/dhk/doc-watson)). The standard is the
authority; this copy exists so the skill works when installed on its own.
`tests/test_rubric_sync.py` fails when the two drift.

Choose by repository need, not prestige.

| Level | Typical repository | Required baseline |
|---|---|---|
| 0 | Experiment, personal script, or archive | Purpose, status, quick usage, licence posture |
| 1 | Active early tool or library | Standard README, truthful setup/usage, licence posture, guides when non-trivial, agent memory when revisited |
| 2 | Mature system or service | Level 1 plus architecture, ownership, operations/install detail, major ADRs, runbooks only when alerts/on-call exist |
| 3 | Credible public OSS with outside consumers | Level 2 public surface plus licence file and contribution/security/community material as participation requires |

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

Score each applicable concern 0 absent, 1 partial or stale, or 2 fit for
purpose. Mark a concern n/a when the level does not require it and no trigger
applies; record n/a separately from 0. Never award points for unnecessary files.

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
