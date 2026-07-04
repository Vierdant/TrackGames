#!/usr/bin/env python3
"""
Rewrites relative import paths ("./x", "../x") to absolute "@/" alias paths.

Assumes tsconfig.json path alias: "@/*" -> "./src/*"
So "@/" resolves to the "src" directory at the project root.

Usage:
    python convert_imports.py [--root ROOT] [--src SRC] [--dry-run]

    --root  Project root directory (default: script's own directory)
    --src   Source directory that "@/" maps to, relative to root (default: src)
    --dry-run  Print planned changes without writing files
"""

import argparse
import re
from pathlib import Path

# File extensions to scan and to resolve imports against.
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
RESOLVE_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
                      "/index.ts", "/index.tsx", "/index.js", "/index.jsx"]

# Matches static imports/exports and dynamic import()/require() with relative specifiers.
IMPORT_RE = re.compile(
    r"""
    (
        (?:from\s+|import\s*\(\s*|require\s*\(\s*)   # preceding keyword
        (['"])
    )
    (\.\.?/[^'"]*)
    (\2)
    """,
    re.VERBOSE,
)


def find_code_files(root: Path):
    skip_dirs = {"node_modules", ".next", ".git", "dist", "build", "out"}
    for path in root.rglob("*"):
        if path.is_dir():
            continue
        if any(part in skip_dirs for part in path.parts):
            continue
        if path.suffix in CODE_EXTENSIONS:
            yield path


def resolve_relative_import(file_path: Path, spec: str, src_dir: Path):
    """Resolve a relative import spec from file_path against src_dir, return '@/...' form or None."""
    base_dir = file_path.parent
    target = (base_dir / spec).resolve()

    try:
        target.relative_to(src_dir.resolve())
    except ValueError:
        # Import escapes the src directory entirely; cannot alias.
        return None

    # Try to find an actual file/dir match to normalize away extensions consistently.
    resolved = None
    for ext in RESOLVE_EXTENSIONS:
        candidate = Path(str(target) + ext) if ext and not ext.startswith("/") else target / ext.lstrip("/") if ext else target
        if ext == "":
            candidate = target
        elif ext.startswith("/"):
            candidate = target / ext[1:]
        else:
            candidate = Path(str(target) + ext)
        if candidate.exists() and candidate.is_file():
            resolved = candidate
            break

    if resolved is None:
        # Fall back to the literal target (e.g. import has no resolvable file, like a .json or asset).
        resolved = target

    rel = resolved.relative_to(src_dir.resolve())
    rel_str = rel.as_posix()

    # Strip resolvable extension for TS/JS files to match original import style (extensionless).
    for ext in (".tsx", ".ts", ".jsx", ".js", ".mjs", ".cjs"):
        if rel_str.endswith(ext):
            rel_str = rel_str[: -len(ext)]
            break

    # Strip trailing /index for index files, since original spec likely omitted it too.
    if rel_str.endswith("/index") and not spec.rstrip("/").endswith("index"):
        rel_str = rel_str[: -len("/index")]

    return f"@/{rel_str}"


def process_file(file_path: Path, src_dir: Path, dry_run: bool):
    text = file_path.read_text(encoding="utf-8")
    changed = False

    def replacer(match):
        nonlocal changed
        prefix, quote, spec, _ = match.groups()
        new_spec = resolve_relative_import(file_path, spec, src_dir)
        if new_spec is None:
            return match.group(0)
        changed = True
        print(f"  {spec}  ->  {new_spec}")
        return f"{prefix}{new_spec}{quote}"

    new_text = IMPORT_RE.sub(replacer, text)

    if changed:
        print(f"{file_path}")
        if not dry_run:
            file_path.write_text(new_text, encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Project root directory")
    parser.add_argument("--src", default="src", help="Directory that @/ maps to, relative to root")
    parser.add_argument("--dry-run", action="store_true", help="Show changes without writing")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    src_dir = root / args.src

    if not src_dir.is_dir():
        raise SystemExit(f"src dir not found: {src_dir}")

    for file_path in find_code_files(root):
        process_file(file_path, src_dir, args.dry_run)


if __name__ == "__main__":
    main()
