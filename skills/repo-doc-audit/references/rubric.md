# Tier and audit rubric

Choose by repository need, not prestige.

| Tier | Typical repository | Required baseline |
|---|---|---|
| 0 | Personal script or archive | Purpose, status, quick usage, licence posture |
| 1 | Active internal tool/library or early public work | Standard README, truthful setup/usage, licence, guides when non-trivial, agent memory when revisited |
| 2 | Operated service or mature transferable product | Tier 1 plus architecture, ownership, operations/install detail, major ADRs, runbooks only when alerts/on-call exist |
| 3 | Credible public OSS with outside consumers | Tier 2 public surface plus contribution/security/community material as participation requires |

Apply these triggers independently:

- Add architecture when the mental model does not fit in one read of the code.
- Add runbooks only for real operational triggers and responders.
- Add contribution, ownership, and governance files only when other people need those contracts.
- Add a roadmap only for an audience asking what comes next.
- Add agent memory when agents resume work across sessions.
- Add a machine-readable contract only when something parses it.
- Add separate install documentation when more than one supported path or significant setup exists.

Score each applicable concern 0 absent, 1 partial/stale, or 2 fit for purpose. Mark non-applicable separately; never award points for unnecessary files.

Audit concerns: purpose/audience; status; value/“so what”; first success; install paths; usage; architecture; data/privacy/security; operations; ownership/contribution; licence; machine contracts; navigation; truthfulness; hygiene/duplication; maintenance/verification.
