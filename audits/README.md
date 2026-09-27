# Audit registry

Audits of enrolled repositories, kept here rather than in the audited
repository (the audit inventory refuses to write inside the repository it
audits).

```text
audits/<owner>/<repo>/<YYYY-MM-DD>/
  audit.md
  scorecard.csv
  evidence.json
```

Each directory is one `repo-doc-audit` run, in the shape
[`skills/repo-doc-audit/references/artifacts.md`](../skills/repo-doc-audit/references/artifacts.md)
defines. The newest directory for a repository is the previous audit the next
sweep compares against (`npm run sweep:check -- --registry
audits/<owner>/<repo>`). An enrolled repository's `last_audit.record` may point
at its directory here.

Records arrive through pull requests like any other change; nothing writes to
`main` directly.
