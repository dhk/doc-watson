# Audit artifact contracts

## `audit.md`

Use: decision; scope, pinned revision, and Doc Watson standard version; audience/lifecycle; findings ordered by impact; justified omissions; recommendation; owner questions. Each finding names its provenance and evidence location.

## `scorecard.csv`

Use this header:

```csv
concern,applicable,score,max_score,proposed_score,status,evidence,recommendation
```

Allowed `score` values are `0`, `1`, `2`, or blank when not applicable. Leave `proposed_score` blank during the audit; `repo-doc-propose` fills it, which together makes the current and proposed scorecard the standard's minimum audit output requires. Allowed `status` values are `observed`, `verified`, `declared`, `proposed`, and `unknown`.

## `evidence.json`

Use this shape:

```json
{
  "repository": "owner/name or absolute isolated path",
  "standard_version": "Doc Watson standard version, e.g. 0.3.0",
  "state": {
    "kind": "git-commit|directory-snapshot",
    "reference": "full commit SHA or stable snapshot identifier"
  },
  "captured_at": "ISO-8601 timestamp",
  "claims": [
    {
      "id": "stable-kebab-id",
      "claim": "one falsifiable statement",
      "status": "observed|verified|declared|proposed|unknown",
      "source": "path, command, or accountable source",
      "notes": "limitations or environment"
    }
  ]
}
```

Use `git-commit` when a full commit SHA exists. For a non-Git directory, use `directory-snapshot` and record a stable identifier for the exact captured before-state, such as an artifact name plus checksum. Do not create a Git repository merely to satisfy this contract.

Do not include secret values or private document bodies.
