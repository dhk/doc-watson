import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
INVENTORY = ROOT / "skills/repo-doc-audit/scripts/inventory.py"
CHECK_DOCS = ROOT / "skills/repo-doc-construct/scripts/check_docs.py"

class ScriptTests(unittest.TestCase):
    def test_inventory_is_stable_and_ignores_generated_content(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "docs").mkdir()
            (root / "node_modules").mkdir()
            (root / "README.md").write_text("# Example\n")
            (root / "docs/guide.md").write_text("# Guide\n")
            (root / "docs/.DS_Store").write_text("noise")
            (root / "node_modules/README.md").write_text("noise")
            result = subprocess.run([sys.executable, INVENTORY, root], check=True, capture_output=True, text=True)
            data = json.loads(result.stdout)
            self.assertEqual([item["path"] for item in data["files"]], ["README.md", "docs/guide.md"])

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

if __name__ == "__main__":
    unittest.main()
