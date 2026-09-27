# Audit artifact contracts

## `audit.md`

Use: decision; scope, pinned revision, and Doc Watson standard version; audience/lifecycle; findings ordered by impact; justified omissions; recommendation; owner questions. Each finding names its provenance and evidence location.

## `scorecard.csv`

Use this header:

```csv
concern,applicable,score,max_score,proposed_score,status,evidence,recommendation,previous_score
```

One row per audit concern, using the concern ID (for example `value-so-what`). Column values:

| Column | Allowed values |
|---|---|
| `applicable` | `yes`; `no` (the level does not require it and no trigger applies); `exempt` (listed in the enrollment's `exemptions`) |
| `score` | `0`, `1` or `2` when `applicable` is `yes`; blank otherwise |
| `max_score` | `2` when `applicable` is `yes`; blank otherwise |
| `proposed_score` | Blank during the audit; `repo-doc-propose` fills it. Together the two make the current and proposed scorecard the standard requires. |
| `previous_score` | Optional. In a re-audit after construction, the score from the approved audit, so the before/after delta is in one file. |
| `status` | The provenance of the score: `observed`, `verified`, `declared`, `proposed` or `unknown` |

## `evidence.json`

Use this shape:

```json
{
  "repository": "owner/name or absolute isolated path",
  "standard_version": "Doc Watson standard version, e.g. 0.3.0",
  "state": {
    "kind": "git-commit|directory-snapshot",
    "reference": "full commit SHA or stable snapshot identifier",
    "dirty": false
  },
  "captured_at": "ISO-8601 timestamp",
  "claims": [
    {
      "classification": "observed|verified|declared|proposed|unknown",
      "summary": "one falsifiable statement",
      "evidence": [{ "kind": "file", "path": "package.json", "startLine": 4 }]
    }
  ]
}
```

Each entry in `claims` follows [`schemas/provenance.schema.json`](https://github.com/dhk/doc-watson/blob/main/schemas/provenance.schema.json), the same shape the MCP server uses. `state` is the audit's before-state; copy it from the inventory's `state`. A re-audit after construction adds `previous_state`, the approved audit's `state`.

Use `git-commit` when a full commit SHA exists. For a non-Git directory, use `directory-snapshot` and record a stable identifier for the exact captured before-state, such as an artifact name plus checksum. Do not create a Git repository merely to satisfy this contract.

Do not include secret values or private document bodies.
