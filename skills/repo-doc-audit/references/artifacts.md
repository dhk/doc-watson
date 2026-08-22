# Audit artifact contracts

## `audit.md`

Use: decision; scope and pinned revision; audience/lifecycle; findings ordered by impact; justified omissions; recommendation; owner questions. Each finding names its provenance and evidence location.

## `scorecard.csv`

Use this header:

```csv
concern,applicable,score,max_score,status,evidence,recommendation
```

Allowed `score` values are `0`, `1`, `2`, or blank when not applicable. Allowed `status` values are `observed`, `verified`, `declared`, `proposed`, and `unknown`.

## `evidence.json`

Use this shape:

```json
{
  "repository": "owner/name or absolute isolated path",
  "revision": "full commit SHA",
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

Do not include secret values or private document bodies.
