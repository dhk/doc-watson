# Evidence provenance

Use these labels in evidence inventories and material findings:

- `observed`: directly present in code, configuration, docs, history, or repository metadata; cite a path and preferably a line or commit.
- `verified`: safely executed or independently checked in the current environment; record command, environment, result, and date.
- `declared`: supplied by an accountable human or authoritative external source; identify source and date.
- `proposed`: desired future state, not current capability.
- `unknown`: material question without sufficient evidence.

An observed command is not verified. A documented promise is not an observed implementation. A plausible inference remains unknown or is explicitly described as an inference.

A claim entry in `evidence.json` follows `schemas/provenance.schema.json` (full file shape in [artifacts.md](artifacts.md)):

```json
{
  "classification": "verified",
  "summary": "The static site builds with Node 22",
  "evidence": [
    { "kind": "file", "path": "package.json", "startLine": 5 },
    { "kind": "command", "check": "npm ci && npm run build: exit 0, Node 22.4, clean worktree, 2026-08-22" }
  ]
}
```

The revision and capture time belong to the whole audit (`state` and `captured_at`), not to each claim. For a `verified` claim, record the command, environment, result, and date in a `command` evidence entry.
