# Evidence model

Every material claim has one of these states during the Doc Watson workflow.

| State | Meaning | Suitable evidence |
|---|---|---|
| **Observed** | Present in an identified source | Code, config, tests, workflows, history, releases, docs |
| **Verified** | Successfully exercised in the audit environment | Recorded command, result, environment, revision |
| **Declared** | Confirmed by an authorized owner | Attributed answer, issue comment, policy, durable record |
| **Proposed** | Recommended future state, not implemented | Approved proposal or open issue |
| **Unknown** | Available evidence cannot establish a material fact | Bounded question naming its consequence and owner |

These describe provenance, not confidence. A repository fact may be observed
but not explain why it exists. A source-derived command remains unverified
until it runs successfully in a stated environment.

## Rules

1. Never silently promote **proposed** to **observed** or **verified**.
2. Never turn inference about purpose, policy, or rationale into **declared** knowledge.
3. Record the inspected repository and revision in every audit.
4. Record important negative evidence with the scope of the search.
5. Treat owner answers as dated inputs; promote durable answers into the repo.
6. Ask one bounded question at a time when it changes a proposal or claim.

## Example claim record

```json
{
  "classification": "observed",
  "summary": "The project requires Node.js 22.",
  "evidence": [{ "kind": "file", "path": ".nvmrc", "startLine": 1 }]
}
```

This is the shape in [`schemas/provenance.schema.json`](../schemas/provenance.schema.json).
The revision belongs to the audit as a whole (its `state`), not to each claim.
Installation was not run here, so the claim stays `observed`, not `verified`.

Published prose need not annotate every sentence. Audit artifacts must retain
enough provenance to review consequential claims.
