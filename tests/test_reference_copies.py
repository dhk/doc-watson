import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Skills are installed on their own, so each carries copies of the files it
# needs. The originals are canonical; these tests fail when a copy drifts.
COPIES = {
    "templates/audit.template.md": "skills/repo-doc-audit/references/audit.template.md",
    "schemas/provenance.schema.json": "skills/repo-doc-audit/references/provenance.schema.json",
    "schemas/enrollment.schema.json": "skills/repo-doc-audit/references/enrollment.schema.json",
    "templates/proposal.template.md": "skills/repo-doc-propose/references/proposal.template.md",
}

class ReferenceCopyTests(unittest.TestCase):
    def test_skill_copies_match_their_originals(self):
        for original, copy in COPIES.items():
            with self.subTest(copy=copy):
                self.assertEqual((ROOT / copy).read_bytes(), (ROOT / original).read_bytes())

if __name__ == "__main__":
    unittest.main()
