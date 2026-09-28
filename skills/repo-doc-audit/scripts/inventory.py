#!/usr/bin/env python3
"""Create a deterministic, read-only repository documentation inventory."""
import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path

DOC_STEMS = {"readme", "license", "licence", "copying", "install", "contributing", "security", "roadmap", "governance", "maintainers", "agents", "claude", "changelog", "code_of_conduct", "code-of-conduct", "codeowners", "support", "authors", "notice"}
DOC_SUFFIXES = {"", ".md", ".mdx", ".rst", ".adoc", ".txt"}
# Any root-level file with one of these suffixes is documentation, whatever its name (DESIGN.md, SKILL.md).
PROSE_SUFFIXES = {".md", ".mdx", ".rst", ".adoc"}
MANIFESTS = {"package.json", "pyproject.toml", "setup.py", "setup.cfg", "requirements.txt", "cargo.toml", "go.mod", "gemfile", "composer.json", "pom.xml", "build.gradle", "dockerfile", "compose.yaml", "compose.yml", "docker-compose.yml", "docker-compose.yaml"}
ENROLLMENT = ".doc-watson.yml"
# Pruned at any depth: dependencies, VCS data, and test fixtures that imitate other repositories.
SKIP_ANYWHERE = {".git", "node_modules", "vendor", ".venv", "fixtures"}
# Pruned only at the root: build output there is generated, but docs/build/ may be real documentation.
SKIP_AT_ROOT = {"dist", "build"}
# Hidden directories are skipped except where repositories keep documentation and workflows.
HIDDEN_ALLOWED = {".github"}

def git(root, *args):
    result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True)
    return result.stdout if result.returncode == 0 else None

def excluded(parts):
    directories = parts[:-1]
    if any(part in SKIP_ANYWHERE for part in directories):
        return True
    if directories and directories[0] in SKIP_AT_ROOT:
        return True
    if any(part.startswith(".") and part not in HIDDEN_ALLOWED for part in directories):
        return True
    name = parts[-1]
    return name.startswith(".") and not (len(parts) == 1 and name == ENROLLMENT)

def tracked_files(root):
    """Committed files when the directory is in a Git work tree, else None."""
    listing = git(root, "ls-files", "-z")
    if listing is None:
        return None
    return sorted(path for path in listing.split("\0") if path)

def walked_files(root):
    for directory, subdirectories, filenames in os.walk(root):
        subdirectories[:] = sorted(subdirectories)
        for name in sorted(filenames):
            path = Path(directory) / name
            if path.is_file() and not path.is_symlink():
                yield path.relative_to(root).as_posix()

def snapshot_id(root, paths):
    """Stable identifier for a non-Git directory: SHA-256 over every included file's path and content hash."""
    digest = hashlib.sha256()
    for rel in sorted(paths):
        if excluded(rel.split("/")):
            continue
        path = root / rel
        if path.is_file() and not path.is_symlink():
            digest.update(rel.encode() + b"\0" + hashlib.sha256(path.read_bytes()).hexdigest().encode() + b"\n")
    return "sha256:" + digest.hexdigest()

def classify(rel):
    parts = rel.split("/")
    name = parts[-1]
    stem, suffix = os.path.splitext(name.lower())
    if rel == ENROLLMENT:
        return "enrollment"
    if len(parts) == 1 and (suffix in PROSE_SUFFIXES or stem in DOC_STEMS and suffix in DOC_SUFFIXES):
        return "documentation"
    if len(parts) == 2 and parts[0] in {".github", "docs"} and stem in DOC_STEMS and suffix in DOC_SUFFIXES:
        return "documentation"
    if parts[0] == "docs":
        return "documentation"
    if name.lower() in MANIFESTS or rel.startswith(".github/workflows/"):
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
    tracked = tracked_files(root)
    paths = tracked if tracked is not None else list(walked_files(root))
    files = []
    for rel in paths:
        if excluded(rel.split("/")):
            continue
        path = root / rel
        kind = classify(rel)
        if kind and path.is_file() and not path.is_symlink():
            files.append({"path": rel, "kind": kind, "bytes": path.stat().st_size})
    files.sort(key=lambda item: item["path"])
    if tracked is not None:
        head = (git(root, "rev-parse", "HEAD") or "").strip() or None
        dirty = bool((git(root, "status", "--porcelain", "--", ".") or "").strip())
        state = {"kind": "git-commit", "reference": head, "dirty": dirty}
        listing = "git ls-files"
    else:
        state = {"kind": "directory-snapshot", "reference": snapshot_id(root, paths), "dirty": None}
        listing = "filesystem walk"
    kinds = ("documentation", "manifest", "enrollment")
    result = {"repository": str(root), "state": state, "listing": listing, "files": files, "counts": {kind: sum(item["kind"] == kind for item in files) for kind in kinds}}
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
