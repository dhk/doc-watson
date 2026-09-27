import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INVENTORY = ROOT / "skills/repo-doc-audit/scripts/inventory.py"
CHECK_DOCS = ROOT / "skills/repo-doc-construct/scripts/check_docs.py"

class ScriptTests(unittest.TestCase):
    def test_inventory_is_stable_and_ignores_generated_content(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "node_modules").mkdir()
            (root / "README.md").write_text("# Example\n")
            (root / "CHANGELOG.md").write_text("# Changes\n")
            (root / "CODE_OF_CONDUCT.mdx").write_text("# Conduct\n")
            (root / "SUPPORT.rst").write_text("Support\n")
            (root / "docs/guide.md").write_text("# Guide\n")
            (root / "docs/.DS_Store").write_text("noise")
            (root / "node_modules/README.md").write_text("noise")
            result = subprocess.run([sys.executable, INVENTORY, root], check=True, capture_output=True, text=True)
            again = subprocess.run([sys.executable, INVENTORY, root], check=True, capture_output=True, text=True)
            self.assertEqual(result.stdout, again.stdout)
            data = json.loads(result.stdout)
            self.assertEqual([item["path"] for item in data["files"]], ["CHANGELOG.md", "CODE_OF_CONDUCT.mdx", "README.md", "SUPPORT.rst", "docs/guide.md"])

    def test_inventory_refuses_output_inside_audited_repository(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "README.md").write_text("# Example\n")
            result = subprocess.run([sys.executable, INVENTORY, root, "--output", root / "inventory.json"], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse((root / "inventory.json").exists())
            self.assertIn("refusing to write inventory inside", result.stderr)

    def test_doc_checker_accepts_valid_relative_link(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "README.md").write_text("[Guide](docs/guide.md)\n")
            (root / "docs/guide.md").write_text("# Guide\n")
            result = subprocess.run([sys.executable, CHECK_DOCS, root], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_doc_checker_rejects_broken_link_and_credential(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "README.md").write_text("[Missing](docs/no.md)\napi_key=abcdefghijklmnop\n")
            result = subprocess.run([sys.executable, CHECK_DOCS, root], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("broken link", result.stdout)
            self.assertIn("possible embedded credential", result.stdout)

    def test_doc_checker_rejects_broken_image_and_repository_escape(self):
        with tempfile.TemporaryDirectory() as directory:
            container = Path(directory)
            root = container / "repository"
            root.mkdir()
            (container / "outside.md").write_text("private\n")
            (root / "README.md").write_text("![Missing](images/architecture.png)\n[Outside](../outside.md)\n")
            result = subprocess.run([sys.executable, CHECK_DOCS, root], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("broken link: images/architecture.png", result.stdout)
            self.assertIn("link escapes repository: ../outside.md", result.stdout)

    def test_doc_checker_checks_mdx(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "guide.mdx").write_text("![Missing](missing.svg)\n")
            result = subprocess.run([sys.executable, CHECK_DOCS, root], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("broken link: missing.svg", result.stdout)

FIXTURES = ROOT / "tests/fixtures"

def run(script, *args):
    return subprocess.run([sys.executable, script, *map(str, args)], capture_output=True, text=True)

class ReviewRegressionTests(unittest.TestCase):
    def test_doc_checker_fails_on_missing_or_file_repository(self):
        with tempfile.TemporaryDirectory() as directory:
            file_path = Path(directory) / "README.md"
            file_path.write_text("# x\n")
            for target in (Path(directory) / "missing", file_path):
                result = run(CHECK_DOCS, target)
                self.assertNotEqual(result.returncode, 0)
                self.assertNotIn("passed", result.stdout)

    def test_doc_checker_ignores_code_other_schemes_and_resolves_root_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "docs/f(1).md").write_text("# f\n")
            (root / "docs/a.md").write_text("[root](/docs/a.md)\n")
            (root / "README.md").write_text(
                "[p](docs/f(1).md)\n`[x](nope.md)`\n```\n[y](nope.md)\n```\n"
                "[f](ftp://example.com/x) [t](tel:+15550100) [d](data:text/plain,hi)\n"
            )
            result = run(CHECK_DOCS, root)
            self.assertEqual(result.returncode, 0, result.stdout)

    def test_doc_checker_checks_reference_links(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "README.md").write_text("[r][ref]\n\n[ref]: docs/missing-ref.md\n")
            result = run(CHECK_DOCS, root)
            self.assertIn("broken link: docs/missing-ref.md", result.stdout)

    def test_doc_checker_secret_detection(self):
        real = [
            '{"api_key": "sk_live_abcdefghijklmnop"}',
            "SECRET_KEY=q8w7e6r5t4y3u2i1o0p9",
            "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMIK7MDENGbPxRfiCY1234",
            "'password': 'q8w7e6r5t4y3u2i1'",
            "Authorization: Bearer abcdefghijklmnopqrstu",
            "token ghp_abcdefghijklmnopqrstuvwxyz0123456789",
        ]
        placeholders = [
            "GITHUB_TOKEN=your_token_here_xyz",
            "API_KEY=REPLACE_WITH_YOUR_KEY",
            "api_key: xxxxxxxxxxxxxxxx",
            "password: changeme-in-production",
            "secret: docs/secrets-handling.md",
            "token: environment/variable/path",
        ]
        for line, expected in [(line, True) for line in real] + [(line, False) for line in placeholders]:
            with self.subTest(line=line), tempfile.TemporaryDirectory() as directory:
                (Path(directory) / "README.md").write_text(line + "\n")
                flagged = "possible embedded credential" in run(CHECK_DOCS, directory).stdout
                self.assertEqual(flagged, expected)

    def test_inventory_finds_common_docs_and_manifests(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for rel in ["LICENCE", "COPYING", ".github/CODEOWNERS", ".github/SECURITY.md",
                        ".github/workflows/ci.yml", "docs/build/install.md", "compose.yml",
                        "docker-compose.yaml", "requirements.txt", "setup.py",
                        "tests/fixtures/app/package.json", "build/out.md"]:
                (root / rel).parent.mkdir(parents=True, exist_ok=True)
                (root / rel).write_text("x\n")
            data = json.loads(run(INVENTORY, root).stdout)
            paths = {item["path"]: item["kind"] for item in data["files"]}
            for rel in ["LICENCE", "COPYING", ".github/CODEOWNERS", ".github/SECURITY.md", "docs/build/install.md"]:
                self.assertEqual(paths.get(rel), "documentation", rel)
            for rel in [".github/workflows/ci.yml", "compose.yml", "docker-compose.yaml", "requirements.txt", "setup.py"]:
                self.assertEqual(paths.get(rel), "manifest", rel)
            self.assertNotIn("tests/fixtures/app/package.json", paths)
            self.assertNotIn("build/out.md", paths)

    def test_inventory_rejects_directory_output(self):
        with tempfile.TemporaryDirectory() as repository, tempfile.TemporaryDirectory() as out:
            (Path(repository) / "README.md").write_text("# x\n")
            result = run(INVENTORY, repository, "--output", out)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("must be a file path", result.stderr)
            self.assertNotIn("Traceback", result.stderr)

    def test_inventory_on_each_fixture(self):
        expected = {
            "tiny-script": {"README.md": "documentation"},
            "public-tool": {"README.md": "documentation", "package.json": "manifest"},
            "internal-service": {"README.md": "documentation", "compose.yaml": "manifest"},
        }
        for fixture, files in expected.items():
            with self.subTest(fixture=fixture):
                data = json.loads(run(INVENTORY, FIXTURES / fixture).stdout)
                self.assertEqual({item["path"]: item["kind"] for item in data["files"]}, files)

class EndToEndRegressionTests(unittest.TestCase):
    """Defects found by the first end-to-end run on dhk/fossil (#10)."""

    def test_inventory_sees_enrollment_and_every_root_doc(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for rel in [".doc-watson.yml", "DESIGN.md", "SKILL.md", "notes.rst", ".gitignore", ".hidden.md"]:
                (root / rel).write_text("x\n")
            data = json.loads(run(INVENTORY, root).stdout)
            paths = {item["path"]: item["kind"] for item in data["files"]}
            self.assertEqual(paths, {".doc-watson.yml": "enrollment", "DESIGN.md": "documentation",
                                     "SKILL.md": "documentation", "notes.rst": "documentation"})
            self.assertEqual(data["counts"]["enrollment"], 1)
            self.assertEqual(data["state"]["kind"], "directory-snapshot")

    def test_inventory_uses_the_committed_tree_and_records_the_commit(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            git = ["git", "-C", str(root), "-c", "user.name=t", "-c", "user.email=t@example.invalid"]
            subprocess.run(git + ["init", "-q"], check=True)
            (root / "README.md").write_text("# x\n")
            subprocess.run(git + ["add", "README.md"], check=True)
            subprocess.run(git + ["commit", "-qm", "init"], check=True)
            (root / "UNTRACKED.md").write_text("draft\n")
            head = subprocess.run(git + ["rev-parse", "HEAD"], check=True, capture_output=True, text=True).stdout.strip()
            data = json.loads(run(INVENTORY, root).stdout)
            self.assertEqual([item["path"] for item in data["files"]], ["README.md"])
            self.assertEqual(data["state"], {"kind": "git-commit", "reference": head, "dirty": True, "source": "git ls-files"})

class AnchorTests(unittest.TestCase):
    """check_docs.py checks #anchors against GitHub's heading slugs (#12)."""

    def check(self, files):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for rel, text in files.items():
                (root / rel).parent.mkdir(parents=True, exist_ok=True)
                (root / rel).write_text(text)
            return run(CHECK_DOCS, root)

    def test_valid_anchors_pass(self):
        guide = (
            "# Guide\n## Value (\u201cso what\u201d)\n## Setup\n## Setup\n"
            "## LinkedIn data \u2014 legal/ToS risk\n## `run.py` flags\n"
            '<a id="Custom-Anchor"></a>\n```\n## not-a-heading\n```\n'
        )
        links = (
            "[a](guide.md#value-so-what) [b](guide.md#setup-1) "
            "[c](guide.md#linkedin-data--legaltos-risk) [d](guide.md#runpy-flags) "
            "[e](guide.md#custom-anchor) [f](#readme) [g](tool.py#L10)\n# Readme\n"
        )
        result = self.check({"guide.md": guide, "README.md": links, "tool.py": "x = 1\n"})
        self.assertEqual(result.returncode, 0, result.stdout)

    def test_broken_anchors_fail(self):
        result = self.check({
            "guide.md": "# Guide\n```\n## Fenced\n```\n",
            "README.md": "[a](guide.md#missing) [b](#nowhere) [c](guide.md#fenced)\n# Readme\n",
        })
        self.assertNotEqual(result.returncode, 0)
        for target in ["guide.md#missing", "#nowhere", "guide.md#fenced"]:
            self.assertIn(f"broken anchor: {target}", result.stdout)

if __name__ == "__main__":
    unittest.main()
