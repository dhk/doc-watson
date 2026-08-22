#!/usr/bin/env python3
"""Create a deterministic, read-only repository documentation inventory."""
import argparse
import json
from pathlib import Path

DOC_NAMES = {"readme.md", "license", "license.md", "install.md", "contributing.md", "security.md", "roadmap.md", "governance.md", "maintainers.md", "agents.md", "claude.md"}
MANIFESTS = {"package.json", "pyproject.toml", "cargo.toml", "go.mod", "gemfile", "composer.json", "dockerfile", "compose.yaml", "docker-compose.yml"}
SKIP = {".git", "node_modules", "vendor", ".venv", "dist", "build"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repository")
    parser.add_argument("--output")
    args = parser.parse_args()
    root = Path(args.repository).resolve()
    if not root.is_dir():
        raise SystemExit(f"not a directory: {root}")
    files = []
    for path in sorted(root.rglob("*")):
        relative_parts = path.relative_to(root).parts
        if not path.is_file() or any(part in SKIP for part in relative_parts) or any(part.startswith(".") and part != ".github" for part in relative_parts):
            continue
        rel = path.relative_to(root).as_posix()
        low = path.name.lower()
        kind = "documentation" if low in DOC_NAMES or rel.startswith("docs/") else "manifest" if low in MANIFESTS or rel.startswith(".github/workflows/") else None
        if kind:
            files.append({"path": rel, "kind": kind, "bytes": path.stat().st_size})
    result = {"repository": str(root), "files": files, "counts": {kind: sum(item["kind"] == kind for item in files) for kind in ("documentation", "manifest")}}
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        print(output, end="")

if __name__ == "__main__":
    main()
