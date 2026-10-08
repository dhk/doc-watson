#!/usr/bin/env python3
"""Check local Markdown links and flag common documentation hazards."""
import argparse
import os
import re
from pathlib import Path
from urllib.parse import unquote

# Inline links and images; the target may contain one level of balanced parentheses.
LINK = re.compile(r"!?\[[^\]]*\]\(((?:[^()\n]|\([^()\n]*\))*)\)")
# Reference-style definitions: [label]: target
REFERENCE = re.compile(r"^ {0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)", re.M)
FENCE = re.compile(r"^ {0,3}(```|~~~).*?^ {0,3}\1[^\n]*$", re.M | re.S)
INLINE_CODE = re.compile(r"(`+)[^`\n].*?\1")
SCHEME = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")

SECRET_WORD = r"(?:api[_-]?key|secret|token|passw(?:or)?d)"
# Identifiers that name a quantity or collection of the word, not a credential:
# tokens, max_tokens, token_count, password_length.
NON_SECRET_SUFFIX = r"(?:s|counts?|limits?|len|length|usage|budgets?|types?|used|total)"
# The secret word must end its identifier or be followed by a separator, so
# "tokens" and "tokenizer" are not keys, and the next segment must not be a
# non-secret suffix. AWS_SECRET_ACCESS_KEY and api_key still match.
SECRET_KEY = rf"[A-Za-z0-9_-]*{SECRET_WORD}(?![A-Za-z0-9])(?![_-]{NON_SECRET_SUFFIX}(?![A-Za-z0-9]))[A-Za-z0-9_-]*"
SECRET_ASSIGNMENT = re.compile(rf"""(?i)["']?{SECRET_KEY}["']?\s*[:=]\s*["']?(?P<value>[^\s"'`,;]{{12,}})""")
SECRET_SHAPES = re.compile(
    r"(?i:authorization:\s*bearer\s+[A-Za-z0-9._~+/-]{12,})"
    r"|\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]{12,}"
    r"|sk-ant-[A-Za-z0-9_-]{12,}|AKIA[0-9A-Z]{16}|xox[abprs]-[A-Za-z0-9-]{10,})\b"
)
PLACEHOLDER = re.compile(r"(?i)your|replace|example|placeholder|changeme|dummy|sample|redacted|xxxx|\*\*\*|\.\.\.|<|\$\{|\$\(")
# A slash-separated word path with no digits reads as a file or prose path, not a credential.
PATH_LIKE = re.compile(r"[A-Za-z_.-]+(?:/[A-Za-z_.-]+)+")
# A call or grouped expression, e.g. cmd.strip().split(), is code, not a literal credential.
CODE_LIKE = re.compile(r"[()]")
IGNORED_DIRECTORIES = {".git", "node_modules", "vendor", ".venv"}

def markdown_files(root):
    for directory, subdirectories, filenames in os.walk(root):
        subdirectories[:] = sorted(name for name in subdirectories if name not in IGNORED_DIRECTORIES)
        for name in sorted(filenames):
            if Path(name).suffix.lower() in {".md", ".mdx"}:
                yield Path(directory) / name

def has_secret(content):
    if SECRET_SHAPES.search(content):
        return True
    for match in SECRET_ASSIGNMENT.finditer(content):
        value = match.group("value")
        if not PLACEHOLDER.search(value) and not PATH_LIKE.fullmatch(value) and not CODE_LIKE.search(value):
            return True
    return False

HEADING = re.compile(r"^ {0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$", re.M)
HTML_ANCHOR = re.compile(r"""<a\s[^>]*\b(?:id|name)\s*=\s*["']([^"']+)["']""", re.I)
MARKDOWN_SUFFIXES = {".md", ".mdx"}

def slug(heading):
    """GitHub's heading anchor: strip markup and punctuation, lowercase, spaces to hyphens."""
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", heading)
    text = re.sub(r"<[^>]+>|[`*]", "", text)
    text = re.sub(r"[^\w\- ]", "", text.lower())
    return text.replace(" ", "-")

def anchors(content):
    """Every anchor a Markdown file defines, with GitHub's -1, -2 suffixes for repeated headings."""
    found, seen = set(), {}
    for heading in HEADING.findall(FENCE.sub("", content)):
        base = slug(heading)
        count = seen.get(base, 0)
        found.add(base if count == 0 else f"{base}-{count}")
        seen[base] = count + 1
    found.update(anchor.lower() for anchor in HTML_ANCHOR.findall(content))
    return found

def link_targets(content):
    prose = INLINE_CODE.sub("", FENCE.sub("", content))
    for raw in LINK.findall(prose) + REFERENCE.findall(prose):
        raw = raw.strip()
        yield raw[1:raw.find(">")] if raw.startswith("<") and ">" in raw else (raw.split() or [""])[0]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repository")
    args = parser.parse_args()
    root = Path(args.repository).resolve()
    if not root.is_dir():
        raise SystemExit(f"not a directory: {root}")
    errors = []
    for doc in markdown_files(root):
        relative = doc.relative_to(root)
        content = doc.read_text(encoding="utf-8", errors="replace")
        if has_secret(content):
            errors.append(f"{relative}: possible embedded credential")
        for target in link_targets(content):
            if not target or SCHEME.match(target):
                continue
            path = unquote(target.split("#", 1)[0].split("?", 1)[0])
            fragment = unquote(target.split("#", 1)[1]) if "#" in target else ""
            if not path:
                if fragment and fragment.lower() not in anchors(content):
                    errors.append(f"{relative}: broken anchor: {target}")
                continue
            # A leading slash is repository-root-relative, as GitHub renders it.
            resolved = (root / path.lstrip("/") if path.startswith("/") else doc.parent / path).resolve()
            if resolved != root and root not in resolved.parents:
                errors.append(f"{relative}: link escapes repository: {target}")
            elif not resolved.exists():
                errors.append(f"{relative}: broken link: {target}")
            elif fragment and resolved.is_file() and resolved.suffix.lower() in MARKDOWN_SUFFIXES:
                linked = resolved.read_text(encoding="utf-8", errors="replace")
                if fragment.lower() not in anchors(linked):
                    errors.append(f"{relative}: broken anchor: {target}")
    if errors:
        print("\n".join(errors))
        raise SystemExit(1)
    print("Documentation checks passed")

if __name__ == "__main__":
    main()
