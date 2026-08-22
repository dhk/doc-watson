#!/usr/bin/env python3
"""Check local Markdown links and flag common documentation hazards."""
import argparse
import re
from pathlib import Path
from urllib.parse import unquote

LINK = re.compile(r"(?<!!)\[[^]]*\]\(([^)]+)\)")
SECRET = re.compile(r"(?i)(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?(?!example|placeholder|<)[A-Za-z0-9_./+-]{12,}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repository")
    args = parser.parse_args()
    root = Path(args.repository).resolve()
    errors = []
    for doc in sorted(root.rglob("*.md")):
        if any(part in {".git", "node_modules", "vendor", ".venv"} for part in doc.relative_to(root).parts):
            continue
        content = doc.read_text(encoding="utf-8", errors="replace")
        if SECRET.search(content):
            errors.append(f"{doc.relative_to(root)}: possible embedded credential")
        for raw in LINK.findall(content):
            target = raw.strip().split()[0].strip("<>")
            if not target or target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            path = unquote(target.split("#", 1)[0])
            if path and not (doc.parent / path).resolve().exists():
                errors.append(f"{doc.relative_to(root)}: broken link: {target}")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("Documentation checks passed")

if __name__ == "__main__":
    main()
