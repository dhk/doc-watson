# Audit-to-ship workflow

Doc Watson separates diagnosis from treatment. An audit does not itself
authorize repository changes; implementation remains traceable to an approved
proposal.

## 1. Establish scope

Record repository and revision, visibility, likely users and maintainers,
lifecycle, requested outcome, and constraints on writes. Treat owner purpose
and audience as **declared**. Never expose private source in public artifacts.

## 2. Inventory evidence

Inspect the smallest sufficient set: root docs and indexes; manifests, config,
and environment examples; entry points and boundaries; tests and CI; releases
and deployment; security, privacy, licence, ownership, and contribution;
relevant history; and duplicated, stale, generated, or contradictory docs.

Record absent evidence as a scoped finding, not a universal claim.

## 3. Classify and audit

Choose a level through [the standard](standard.md), then apply trigger rules.
Score fitness rather than volume. Assess applicable purpose, “so what,” status,
first use, architecture, data and side effects, ownership, navigation, hygiene,
validation, and maintenance.

Output the decision, evidence, findings, deliberate omissions, and unknowns.

## 4. Propose the after-state

Produce a file-level manifest before writing. State what each file does, what
it replaces or links to, and why it is earned. Offer separate proposals when
audiences materially differ, such as internal use versus handover.

Ask one owner question at a time only when it changes the proposal or claim,
and explain why it matters.

## 5. Construct

1. Link an accurate canonical source where one exists.
2. Generate reference from code or schemas where practical.
3. Synthesize explanation while retaining provenance.
4. Insert explicit unknowns when organizational knowledge is missing.
5. Use templates only for triggered documents.

Keep tutorials, task guides, reference, and explanation distinct. The README
remains a front door, not a container for every detail.

## 6. Verify

Working interactively with the maintainer, classify available checks by
authorization, safety, cost, network use, and side effects. Run permitted
install, build, test, lint, and representative usage checks; check links and
Mermaid; compare reference with source; inspect for drift; confirm no private
data or credentials entered the change; and re-run the audit. Skip and report
unsafe, expensive, networked, destructive, or unauthorized checks.

Label commands **observed, not verified** when they cannot run. A build
does not prove behavior.

Required CI and shared team gates are future operating modes. The initial
workflow does not require a maintainer to establish them before using Doc
Watson.

## 7. Ship and preserve

The issue and pull request include the problem and level, before evidence,
approved manifest, validation, unknowns, after score, and linked artifacts.

A case-study package may preserve exact before state, audit, machine-readable
scorecard, proposal, patch, after state, and narrative—never secrets or private
source.

## Re-audit

Re-run hygiene checks after material architecture, installation, release,
ownership, or positioning changes. The goal is not permanent completeness; it
is a reliable current way into the repository.
