# Documentation audit: dhk/fossil

**Review status:** unreviewed (unattended run — sweep dry run, 2026-09-27)

**Revision:** b1a124f6f7985389982c6a531fa6dd9ae34d380f (`main`, clean worktree)

**Standard:** Doc Watson 0.3.0

**Visibility:** private (GitHub repository metadata, read 2026-09-27)

**Limits:** Static inspection only. No pipeline phase, install, `--help` or
`compileall` was run in the fossil checkout (sweep rule: no repository
pipelines or installs). Python sources were parsed with `ast` and the two
committed JSON schemas with `json.load`, both outside the checkout. The local
first run recorded in `docs/installation.md:46` was not repeated. The
inventory script lists documentation and manifests only, so source files were
read directly.

## Decision

Treat this repository as **Level 1** because the enrollment declares it
(`.doc-watson.yml:8`, declared) and the evidence agrees: an active,
single-maintainer, source-run prototype with no published package, no hosting
and no outside contributors (README.md:5, README.md:126-132, CONTRIBUTING.md:3;
observed).

## Audience and lifecycle

Declared audience: the owner, and agents that run or extend Fossil Record for
the owner (`.doc-watson.yml:9`). Lifecycle: active early prototype, smoke-tested
on fixtures, not validated end to end on a real repository (README.md:5,
DESIGN.md:5; observed).

## Evidence inventory

- **Observed:** README.md, DESIGN.md, SKILL.md, CLAUDE.md, CONTRIBUTING.md,
  SECURITY.md, LICENSE, docs/installation.md, docs/data-and-privacy.md,
  docs/snapshots/2026-05-23-design-session.md, requirements.txt,
  .github/workflows/ci.yml, skill/*.py (9 files), concept-state.json,
  run-manifest.json, .doc-watson.yml.
- **Verified:** `check_docs.py` on the checkout exited 0 (Python 3.11.15,
  2026-09-27); all `skill/*.py` parse with `ast`; both JSON schemas parse;
  `.doc-watson.yml` validates against `schemas/enrollment.schema.json` under
  YAML 1.2 and 1.1 (`npm run -s sweep:check`, exit 0).
- **Declared:** level, audience, twelve trigger decisions, no exemptions,
  `on_drift: issue-and-draft-pr` (`.doc-watson.yml`); first run last verified
  2026-09-27 on base `a16d663` (docs/installation.md:46).
- **Proposed:** none (no proposal produced in this run).
- **Unknown:** whether the first run still passes after `4bd8dfb` (Phase 1
  root-commit LOC change); setup commands are unchanged since the verification.

## Scorecard

| Concern | Score | Proposed (filled by the proposal) | Evidence |
|---|---:|---:|---|
| Purpose and audience | 2 | | README.md:1-5, :18 |
| Status and limits | 2 | | README.md:5, :126-132; DESIGN.md:99-110 |
| Value (“so what”) | 2 | | README.md:7-18 |
| First success | 2 | | README.md:32-56; docs/installation.md:46 |
| Install paths | 2 | | README.md:58-60; docs/installation.md |
| Usage | 2 | | README.md:62-75; SKILL.md:25-67 |
| Architecture | 2 | | DESIGN.md:18-89 |
| Data, privacy, and security | 2 | | README.md:20-30; docs/data-and-privacy.md; SECURITY.md |
| Operations | n/a | | `runbooks` false; nothing hosted |
| Ownership and contribution | n/a | | `codeowners`, `contributing`, `governance` all false |
| Licence | 2 | | LICENSE; README.md:136-138 |
| Decisions | n/a | | `adrs` false |
| Agent memory | 2 | | CLAUDE.md |
| Machine contracts | 2 | | SKILL.md:1-17 |
| Navigation | 2 | | README.md:30, :60, :111, :134 |
| Truthfulness | 2 | | code cross-checks below |
| Hygiene and duplication | 2 | | check_docs.py exit 0 |
| Maintenance and verification | 2 | | CONTRIBUTING.md:15-31; ci.yml |

Use 0 = absent, 1 = partial or stale, 2 = fit for purpose, n/a = not required
at this level and no trigger applies. See the standard's scoring section.

## Divergence

- **Standard version:** current (declared 0.3.0, current 0.3.0).
- **Regression:** cannot be assessed. `last_audit.record` is dhk/fossil#33
  (findings only) and its comment points to dhk/adventures-in-ai#59, which
  holds journey totals (e.g. "Use 8/8"), not per-concern scores. The registry
  `audits/dhk/fossil/` has no earlier scorecard. This audit is the baseline.
- **Hygiene failures:** none (`check_docs.py`: "Documentation checks passed").
- **Contradicted declarations:** none. `contributing: false` agrees with
  CONTRIBUTING.md:3 ("does not invite outside contributions"); the four
  `applies: true` triggers each have the document they name.
- **Enrollment validity:** valid.

## Findings

### Low — Phase 1 write omitted from the trust-boundary table

docs/data-and-privacy.md:36 lists only `raw/*.commits.json` for Phase 1, but
Phase 1 also writes `runs/<date>/checkpoint.json`
(skill/phase1_discovery.py:224; SKILL.md:73 says so). Observed. Consequence:
the one document meant to enumerate local writes is incomplete. Correction:
add `checkpoint.json` to the Phase 1 row. Not mechanical under the sweep's
definition (not a link), so it would not go in a sweep PR.

### Low — first-run verification predates the latest code change

docs/installation.md:46 was verified on base `a16d663`; `4bd8dfb` changed
Phase 1 since. Setup is unchanged, so the claim is still observed-true for
installation; the Tier/output wording is unknown until re-run. Disposition:
re-run at the next setup-touching change, as CONTRIBUTING.md:31 already asks.

### Info — code claims cross-checked and true

Tier thresholds 150,000/500,000 (skill/phase1_discovery.py:19-20), 130,000 and
50,000 character caps and three retries (skill/phase2_extraction.py:140-268),
model `claude-sonnet-4-6` (skill/phase2_extraction.py:144), deferred phase
imports (skill/run.py:56-72, 154) and the flag table (SKILL.md:25-56 against
skill/run.py:310-360) match the documentation. Observed.

## Deliberate omissions

- CODEOWNERS, governance, roadmap, runbooks, handover, ADRs, user guides — each
  trigger is declared false with a reason and no evidence contradicts it.
- No new CONTRIBUTING content — the existing file is an owner/agent workflow
  record, not an invitation; nothing requires it and it earns no points.

## Recommendation

No sweep action is required. The smallest credible next step is a one-line
fix to docs/data-and-privacy.md:36, at the owner's discretion.

## Owner questions

1. Should `last_audit.record` in `.doc-watson.yml` point at this registry
   record (`audits/dhk/fossil/2026-09-27/` in dhk/doc-watson) so later audits
   can assess regression from `last_audit` as well as from the registry?
   Only the owner edits the enrollment file.
