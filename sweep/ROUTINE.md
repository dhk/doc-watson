# Sweep routine

The instructions a scheduled Claude Code session follows. They implement the
contract in [`docs/sweep.md`](../docs/sweep.md) and assume nothing from any
earlier session. Dates are UTC (`date -u +%F`).

## Before starting

1. Read `AGENTS.md`, `docs/sweep.md`, and the divergence rules in
   `docs/standard.md`.
2. In the doc-watson checkout, run `git fetch origin main` and work from a
   branch created from `origin/main`: the branch this session is assigned if
   it has one, otherwise `sweep/<date>`. Run `npm ci`. Run every `npm`
   command below from the doc-watson checkout; the paths are relative to it.
3. Read `sweep/scope.json`. The checkout for `owner/name` is the directory
   `name` next to the doc-watson checkout. If it is missing, clone
   `https://github.com/owner/name` into a scratch directory. If that fails,
   record the repository as unreachable and go on.

## For each repository in scope

1. Audit the default branch, never the checkout's current branch or working
   tree: `git -C <checkout> fetch origin`, find the default branch with
   `git -C <checkout> ls-remote --symref origin HEAD`, then
   `git -C <checkout> worktree add --detach <scratch>/<name> origin/<default>`.
   Use that worktree (`<tree>`) for every step below, and remove it at the
   end with `git -C <checkout> worktree remove <scratch>/<name>`.
2. Run `npm run -s sweep:check -- --repo <tree>`. Exit 2 is an environment
   error: record it and go on. If the report says `enrolled: false`, record
   "not enrolled" and move to the next repository; nothing else happens for
   it.
3. Run the `repo-doc-audit` skill on `<tree>` as an **unattended** run
   (`skills/repo-doc-audit/SKILL.md`). Do not run `repo-doc-propose`; a
   proposal waits for the owner. Write the artifacts to
   `audits/<owner>/<name>/<date>/`.
4. Run
   `npm run -s sweep:check -- --repo <tree> --current audits/<owner>/<name>/<date>/scorecard.csv --registry audits/<owner>/<name>`.
   The divergences are this report's list plus any contradicted declaration
   the audit recorded. "Regression not assessed" (the report's
   `regression.assessed: false`) is not a divergence; say so in the summary.
5. Act only as the repository's `on_drift` allows, and only on divergence:
   - `report`: nothing beyond the audit record.
   - `issue`: update the one open issue in that repository labelled
     `doc-watson`; create it only if none is open. Create the label if it is
     missing and the tools allow; otherwise title the issue
     `[doc-watson] Documentation divergence`. The issue lists the date, the
     audited commit, each divergence, and the audit's owner questions, and
     links the audit record. When there is no divergence, open no issue; if
     one is already open, comment that none was found and leave closing it to
     the owner. Owner questions without a divergence stay in the audit record.
   - `issue-and-draft-pr`: the issue as above, plus one **draft** pull request
     that fixes only the divergences the report marks `mechanical` (broken
     links and anchors). Follow that repository's own branch and issue rules
     (its `CLAUDE.md` or `AGENTS.md`), link the issue, and update an existing
     sweep draft rather than opening a second.

## After all repositories

1. Commit the new `audits/` records on the branch from step 2 and open or
   update one doc-watson pull request for them. It references the open
   doc-watson issue titled `Sweep: audit records`; create that issue once if
   it does not exist. Never push to `main`.
2. End with a summary table: repository, enrolled, divergences, regression
   assessed or not, actions taken, and anything unreachable or skipped.

## Never

- Merge anything, or mark a draft ready for review.
- Edit a `.doc-watson.yml`. A stale standard, a stale `last_audit`, or a
  contradicted declaration is a question for the owner in the issue.
- Change a checkout's branch or working tree; audit the detached worktree.
- Put a credential or its contents in an issue; report a possible credential
  by file path only.
- Run a repository's own pipelines, installs, or anything that calls a paid
  API. Inspection and the checks named here are the only commands.
