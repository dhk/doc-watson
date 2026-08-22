#!/usr/bin/env python3
"""Create a deterministic, read-only repository documentation inventory."""
import argparse
import json
from pathlib import Path

DOC_STEMS = {"readme", "license", "install", "contributing", "security", "roadmap", "governance", "maintainers", "agents", "claude", "changelog", "code_of_conduct", "code-of-conduct", "support", "authors", "notice"}
DOC_SUFFIXES = {"", ".md", ".mdx", ".rst", ".adoc", ".txt"}
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
        is_root_doc = len(relative_parts) == 1 and path.stem.lower() in DOC_STEMS and path.suffix.lower() in DOC_SUFFIXES
        kind = "documentation" if is_root_doc or rel.startswith("docs/") else "manifest" if low in MANIFESTS or rel.startswith(".github/workflows/") else None
        if kind:
            files.append({"path": rel, "kind": kind, "bytes": path.stat().st_size})
    result = {"repository": str(root), "files": files, "counts": {kind: sum(item["kind"] == kind for item in files) for kind in ("documentation", "manifest")}}
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        output_path = Path(args.output).resolve()
        if output_path == root or root in output_path.parents:
            raise SystemExit("refusing to write inventory inside the audited repository; use stdout or an external artifact directory")
        output_path.write_text(output, encoding="utf-8")
    else:
        print(output, end="")

if __name__ == "__main__":
    main()
