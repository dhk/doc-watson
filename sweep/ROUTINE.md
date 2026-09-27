# Sweep routine

The instructions a scheduled Claude Code session follows. They implement the
contract in [`docs/sweep.md`](../docs/sweep.md) and assume nothing from any
earlier session.

## Before starting

1. Read `AGENTS.md`, `docs/sweep.md`, and the divergence rules in
   `docs/standard.md`.
2. In the doc-watson checkout, update `main` and run `npm ci`.
3. Read `sweep/scope.json`. Every repository in it should be available as a
   checkout in this environment. Record any that is not as unreachable and go
   on.

## For each repository in scope

1. Update the checkout to the default branch. Do not change it otherwise.
2. Run `npm run -s sweep:check -- --repo <checkout>`. If the report says
   `enrolled: false`, record "not enrolled" and move to the next repository.
   Nothing else happens for an unenrolled repository.
3. Run the `repo-doc-audit` skill on the checkout as an **unattended** run
   (skills/repo-doc-audit/SKILL.md). Write its artifacts to
   `audits/<owner>/<repo>/<YYYY-MM-DD>/` in the doc-watson working tree.
4. Run
   `npm run -s sweep:check -- --repo <checkout> --current audits/<owner>/<repo>/<YYYY-MM-DD>/scorecard.csv --registry audits/<owner>/<repo>`.
   The divergences are this report plus any contradicted declaration the
   audit recorded.
5. Act only as the repository's `on_drift` allows:
   - `report`: nothing beyond the audit record.
   - `issue`: find the one open issue in that repository labelled
     `doc-watson` (or titled `[doc-watson] …` if the label does not exist)
     and update it; create it only if none is open. It lists the date,
     commit, each divergence, and the owner questions, and links the audit
     record. If there is no divergence and an issue is open, comment that
     none was found and leave closing it to the owner.
   - `issue-and-draft-pr`: the issue as above, plus one **draft** pull
     request for the divergences marked `mechanical` only (broken links and
     anchors). Follow that repository's own branch and issue rules
     (its `CLAUDE.md` or `AGENTS.md`), link the issue, and update an existing
     sweep draft rather than opening a second.

## After all repositories

1. Open or update one pull request in doc-watson that adds the new
   `audits/` records. Never push to `main`.
2. End with a summary table: repository, enrolled, divergences, actions
   taken, and anything unreachable or skipped.

## Never

- Merge anything, or mark a draft ready for review.
- Edit a `.doc-watson.yml`; a stale standard or contradicted declaration is a
  question for the owner in the issue.
- Put a credential or its location's contents in an issue; a possible
  credential is reported by file path only.
- Run a repository's own pipelines, installs, or anything that calls a paid
  API. Inspection and the checks named here are the only commands.
