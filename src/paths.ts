import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { DomainError } from "./types.js";

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== "..")
  );
}

export async function resolveExistingWithin(
  candidate: string,
  allowedRoots: string[],
): Promise<string> {
  if (!path.isAbsolute(candidate)) {
    throw new DomainError("INVALID_INPUT", "Path must be absolute");
  }
  const target = await realpath(candidate).catch(() => {
    throw new DomainError("INVALID_INPUT", "Path does not exist");
  });
  const roots = await Promise.all(allowedRoots.map((root) => realpath(root)));
  if (!roots.some((root) => isWithin(root, target))) {
    throw new DomainError(
      "PATH_NOT_ALLOWED",
      "Path is outside the allowed roots",
    );
  }
  return target;
}

export async function resolveOutputWithin(
  candidate: string,
  allowedRoots: string[],
): Promise<string> {
  if (!path.isAbsolute(candidate)) {
    throw new DomainError("INVALID_INPUT", "Output path must be absolute");
  }
  const parent = await realpath(path.dirname(candidate)).catch(() => {
    throw new DomainError("INVALID_INPUT", "Output parent does not exist");
  });
  const roots = await Promise.all(allowedRoots.map((root) => realpath(root)));
  const resolved = path.join(parent, path.basename(candidate));
  if (!roots.some((root) => isWithin(root, resolved))) {
    throw new DomainError(
      "PATH_NOT_ALLOWED",
      "Output path is outside the allowed roots",
    );
  }
  try {
    const stat = await lstat(resolved);
    if (stat.isSymbolicLink()) {
      throw new DomainError(
        "PATH_NOT_ALLOWED",
        "Output path may not be a symbolic link",
      );
    }
  } catch (error) {
    if (error instanceof DomainError) throw error;
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  return resolved;
}

export function safeRelativePath(value: string): string {
  const normalized = path.normalize(value);
  if (
    path.isAbsolute(value) ||
    normalized === ".." ||
    normalized.startsWith(`..${path.sep}`)
  ) {
    throw new DomainError(
      "PATH_NOT_ALLOWED",
      "Document path escapes the output root",
    );
  }
  return normalized;
}
