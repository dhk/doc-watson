# Contributing

Doc Watson is an early open-source project. Issues and pull requests are
welcome, but its public interfaces are still taking shape.

## Before making a change

Open or find an issue for material changes, especially changes to documentation
levels, evidence states, output contracts, and skill or MCP interfaces.

## Pull requests

1. Create a focused branch from `main`.
2. Keep observed facts, owner declarations, proposals, and unknowns distinct.
3. Update indexes when adding or moving documents.
4. Preview Mermaid diagrams on GitHub or another compatible renderer.
5. Explain what was verified and what remains unverified.
6. Link the issue the pull request resolves.

Do not add a document merely because a template exists. Apply the trigger rules
in [the standard](docs/standard.md) and remove unused template sections.

## Writing principles

- Lead with the reader's job and the project's effect.
- Prefer executable examples to long setup prose.
- Link to a canonical reference instead of copying mutable facts.
- Do not infer product purpose, policy, or historical rationale from file layout.
- Use Mermaid for diagrams that benefit from reviewable source.

## Security reports

Do not put credentials, private repository content, or exploit details in a
public issue. Until a private reporting route is published, use GitHub private
vulnerability reporting when available; otherwise open a non-sensitive issue
asking the maintainer to establish a private channel.
