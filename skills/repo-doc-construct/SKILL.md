---
name: repo-doc-construct
description: Construct and validate repository documentation from an approved proposal and repository evidence. Use when an agent needs to write or reorganize README, installation, architecture, guides, reference, handover, agent memory, or community files; trim duplication; verify commands and links; and prepare an evidence-backed documentation change or pull request.
---

# Repository documentation constructor

Build approved documentation from evidence. Optimize for truth, navigation, first success, and maintainability rather than volume.

## Workflow

1. Confirm the approved scope, target level, mutation authority, branch policy, and files owned by other concurrent work. The proposal's approval line must read approved. Record any owner decision made at approval time, including an item moved in from "Not included", in the proposal's approval section or a dated addendum, as a `declared` fact with its date.
2. Read [construction-rules.md](references/construction-rules.md) and the relevant audit, evidence inventory, proposal, manifests, code, tests, workflows, and existing docs.
3. Preserve unrelated changes. The before state is the approved audit's `evidence.json` `state`. If the repository has moved since that audit, run the audit's inventory again and record the new state as well.
4. Write one canonical source per fact. Replace duplication with links; do not silently delete historically valuable material.
5. Mark current, planned, experimental, deprecated, and unknown behavior explicitly.
6. Create concise Mermaid diagrams only when they clarify value, flow, architecture, ownership, or trust boundaries. Keep each diagram to one concern.
7. Write commands only from repository evidence. Verify safe commands in an isolated environment when authorized. Record unrun commands as observed, not verified. Record each verification where the target's readers look for it (usually the install guide) with date, environment, command, and outcome, and name the base commit or the change. A file cannot name the SHA of the commit that adds it.
8. Ask one question at a time for facts that code cannot prove, especially audience, purpose, ownership, operational responsibility, and handover acceptance. Use a visible placeholder when work can continue safely. In an unattended run, do not guess: leave the placeholder, list the question in the delivery report, and do not mark the change ready for review.
9. Classify the repository's existing checks by safety, cost, network use, and side effects. Run only checks already authorized and safe in the current environment, followed by `python3 <this skill's directory>/scripts/check_docs.py REPOSITORY` (the script ships with this skill; a missing or non-directory REPOSITORY is an error, not a pass). Skip unsafe, destructive, expensive, networked, or unauthorized checks and report each as unverified with the reason. Review failures instead of weakening checks.
10. Re-run the `repo-doc-audit` skill into a new artifact set. Fill `previous_score` in its `scorecard.csv` from the approved audit and `previous_state` in its `evidence.json`, so the before/after delta is in the artifacts. If the re-audit finds a defect in this change, fix it and re-audit before delivery.
11. Deliver as the approval specifies. The default is one branch with a pull request that links the issue, lists each proposal item and what was done, shows the before/after scores, and names residual unknowns. Never merge.

## Safety and authority

- Documentation implementation does not authorize deployment, release, publication, visibility changes, archival, merge, or external messages.
- Never expose secrets, personal data, private paths, or production identifiers. Use variable names and safe examples.
- Never claim a package, endpoint, install path, licence, support promise, compatibility range, or security property without evidence.
- Keep declared owner context distinguishable from observed and verified facts.
- For destructive or externally mutating procedures, document preview, confirmation, rollback, and recovery before the action.
- Link related foundation work as `#1` and MCP work as `#3` when operating in `dhk/doc-watson`.

## Definition of done

The target reader can explain what the repository is, why it matters, what works now, how to reach first success, how the system fits together, where risk boundaries lie, and where canonical detail lives. All links, including `#anchors`, and safe checks pass, provenance is retained in the delivery evidence, and unresolved claims remain visible.

For Doc Watson project context, see [foundation #1](https://github.com/dhk/doc-watson/issues/1) and [MCP interface #3](https://github.com/dhk/doc-watson/issues/3).
