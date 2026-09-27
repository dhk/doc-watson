#!/usr/bin/env python3
"""Create a deterministic, read-only repository documentation inventory."""
import argparse
import json
import os
from pathlib import Path

DOC_STEMS = {"readme", "license", "licence", "copying", "install", "contributing", "security", "roadmap", "governance", "maintainers", "agents", "claude", "changelog", "code_of_conduct", "code-of-conduct", "codeowners", "support", "authors", "notice"}
DOC_SUFFIXES = {"", ".md", ".mdx", ".rst", ".adoc", ".txt"}
MANIFESTS = {"package.json", "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt", "cargo.toml", "go.mod", "gemfile", "composer.json", "pom.xml", "build.gradle", "dockerfile", "compose.yaml", "compose.yml", "docker-compose.yml", "docker-compose.yaml"}
# Pruned at any depth: dependencies, VCS data, and test fixtures that imitate other repositories.
SKIP_ANYWHERE = {".git", "node_modules", "vendor", ".venv", "fixtures"}
# Pruned only at the root: build output there is generated, but docs/build/ may be real documentation.
SKIP_AT_ROOT = {"dist", "build"}
# Hidden directories are skipped except where repositories keep documentation and workflows.
HIDDEN_ALLOWED = {".github"}

def walk(root):
    for directory, subdirectories, filenames in os.walk(root):
        at_root = Path(directory) == root
        subdirectories[:] = sorted(
            name for name in subdirectories
            if name not in SKIP_ANYWHERE
            and not (at_root and name in SKIP_AT_ROOT)
            and (not name.startswith(".") or name in HIDDEN_ALLOWED)
        )
        for name in sorted(filenames):
            if name.startswith("."):
                continue
            path = Path(directory) / name
            if path.is_file() and not path.is_symlink():
                yield path

def classify(rel, path):
    parts = rel.split("/")
    low = path.name.lower()
    named_doc = path.stem.lower() in DOC_STEMS and path.suffix.lower() in DOC_SUFFIXES
    if (len(parts) == 1 or parts[0] in {".github", "docs"} and len(parts) == 2) and named_doc:
        return "documentation"
    if parts[0] == "docs":
        return "documentation"
    if low in MANIFESTS or rel.startswith(".github/workflows/"):
        return "manifest"
    return None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repository")
    parser.add_argument("--output")
    args = parser.parse_args()
    root = Path(args.repository).resolve()
    if not root.is_dir():
        raise SystemExit(f"not a directory: {root}")
    files = []
    for path in walk(root):
        rel = path.relative_to(root).as_posix()
        kind = classify(rel, path)
        if kind:
            files.append({"path": rel, "kind": kind, "bytes": path.stat().st_size})
    files.sort(key=lambda item: item["path"])
    result = {"repository": str(root), "files": files, "counts": {kind: sum(item["kind"] == kind for item in files) for kind in ("documentation", "manifest")}}
    output = json.dumps(result, indent=2) + "\n"
    if args.output:
        output_path = Path(args.output).resolve()
        if output_path == root or root in output_path.parents:
            raise SystemExit("refusing to write inventory inside the audited repository; use stdout or an external artifact directory")
        if output_path.is_dir():
            raise SystemExit(f"--output must be a file path, not a directory: {output_path}")
        output_path.write_text(output, encoding="utf-8")
    else:
        print(output, end="")

if __name__ == "__main__":
    main()
