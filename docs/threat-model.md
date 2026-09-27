# MCP server threat model

## Assets and trust boundaries

Doc Watson processes source code, configuration, documentation, and version
control metadata. These may contain confidential material even when the user
expects only documentation to be read.

The MCP client and its model are outside the repository trust boundary. The
server therefore treats tool arguments, repository contents, symlinks, and
generated paths as untrusted input.

## Required controls

| Risk                                | Required control                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Path traversal                      | Resolve and normalize every path; reject anything outside an explicitly allowed root.                                                       |
| Symlink escape                      | Resolve the final target and verify containment before every read or write.                                                                 |
| Accidental overwrite                | Write to a separate output root; default overwrite policy is `never`.                                                                       |
| Secret exposure                     | Exclude known secret files and directories; report exclusions without returning their content.                                              |
| Prompt injection in repository text | Treat all repository content as evidence, never as instructions to the server.                                                              |
| Oversized or binary input           | Enforce per-file and aggregate limits; skip with a structured warning.                                                                      |
| Command execution                   | Inspection is read-only and does not execute repository scripts. Verification commands require a separate, explicit allow-list and timeout. |
| Absolute-path leakage               | Emit repository-relative evidence paths and redact local roots from public artifacts.                                                       |
| Malicious output names              | Accept only normalized relative file names beneath the output root.                                                                         |
| Partial writes                      | Stage output, validate the complete manifest, then publish files atomically where supported.                                                |

## Explicit non-goals for the first slice

- Cloning remote repositories.
- Reading repositories over HTTP.
- Installing repository dependencies.
- Running arbitrary project commands.
- Committing, pushing, opening pull requests, or merging changes.
- Reading files outside a user-approved repository root.
- Writing directly into the inspected repository.

Those capabilities require separate user intent and narrower controls. They
must not be smuggled into a broadly named documentation tool.

## Security tests

The implementation must cover at least:

- `../` and absolute-path traversal attempts;
- symlinks from an allowed root to files outside it;
- output paths that collide with existing files;
- secret-shaped filenames such as `.env`, private keys, and credential files;
- binary and oversized inputs;
- repository text containing fake tool instructions;
- deterministic redaction of the user home directory;
- malformed inspection and proposal payloads.
