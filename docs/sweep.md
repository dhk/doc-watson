# Sweep

> **Status: built, not yet scheduled.** The deterministic checks
> ([`sweep/check.ts`](../sweep/check.ts), `npm run sweep:check`), the scope
> ([`sweep/scope.json`](../sweep/scope.json)), the audit registry
> ([`audits/`](../audits/README.md)) and the routine a scheduled session follows
> ([`sweep/ROUTINE.md`](../sweep/ROUTINE.md)) exist. No schedule runs them yet.

The sweep keeps enrolled repositories aligned with the standard without making
decisions that belong to their owners.

## Scope

The sweep audits only repositories that have a valid `.doc-watson.yml` (see
[Enrollment](standard.md#enrollment)). The owner's initial working set is the
twelve repositories in their current Claude Code environment; a repository
outside it is not swept even if it is enrolled.

## Each run

1. List the repositories in scope and read each `.doc-watson.yml`.
2. Run the audit (`repo-doc-audit`) against the repository's default branch,
   using the declared level, trigger decisions, and exemptions.
3. Compare the result with the previous audit and with the declarations,
   using the standard's [divergence](standard.md#divergence) rules.
4. Record the audit in this repository, not in the target (the audit
   inventory already refuses to write inside the repository it audits).
5. Act on divergence as the repository's `on_drift` allows.

## Acting on divergence

| `on_drift`           | The sweep may                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| `issue-and-draft-pr` | Open or update one issue labelled `doc-watson`, and open or update one draft pull request for mechanical fixes |
| `issue`              | Open or update one issue labelled `doc-watson`                                                                 |
| `report`             | Record the finding in this repository only                                                                     |

Mechanical fixes are the ones the evidence alone settles: a broken link, a
stale copy of the standard, a hygiene failure. A contradicted declaration, a
new level, or any purpose or rationale is written into the issue as a single
bounded question for the owner and never into a pull request.

The sweep never merges, never marks a draft ready for review, never edits
`.doc-watson.yml`, and keeps at most one open issue and one open draft per
repository, updating them rather than adding more.
