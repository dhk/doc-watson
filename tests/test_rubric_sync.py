import re
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
STANDARD = ROOT / "docs/standard.md"
RUBRIC = ROOT / "skills/repo-doc-audit/references/rubric.md"

def section(text, heading):
    """Return the lines under a Markdown heading, up to the next heading."""
    match = re.search(rf"^#+ {re.escape(heading)}\n(.*?)(?=^#+ |\Z)", text, re.M | re.S)
    if not match:
        raise AssertionError(f"missing section: {heading}")
    return match.group(1)

def numbered_items(block):
    return re.findall(r"^\d+\. (.+)$", block, re.M)

def table_rows(block):
    return [line.strip() for line in block.splitlines() if line.startswith("|")]

def bullets(block):
    items = re.split(r"^- ", block, flags=re.M)[1:]
    return [" ".join(item.split()) for item in items]

class RubricSyncTests(unittest.TestCase):
    """The audit skill carries a copy of the standard so it works when installed alone."""

    def setUp(self):
        self.standard = STANDARD.read_text(encoding="utf-8")
        self.rubric = RUBRIC.read_text(encoding="utf-8")

    def test_rubric_names_the_current_standard_version(self):
        version = re.search(r"^\*\*Version:\*\* (\S+)", self.standard, re.M).group(1)
        self.assertIn(f"standard {version}", self.rubric)

    def test_audit_concerns_match(self):
        expected = numbered_items(section(self.standard, "Audit concerns"))
        self.assertTrue(expected)
        self.assertEqual(numbered_items(section(self.rubric, "Audit concerns")), expected)

    def test_trigger_rules_match(self):
        expected = bullets(section(self.standard, "Trigger rules"))
        self.assertTrue(expected)
        self.assertEqual(bullets(section(self.rubric, "Trigger rules")), expected)

    def test_levels_table_matches(self):
        expected = table_rows(section(self.standard, "Levels"))
        self.assertTrue(expected)
        self.assertEqual(table_rows(section(self.rubric, "Levels")), expected)

    def test_scoring_scale_matches(self):
        expected = table_rows(section(self.standard, "Scoring"))
        self.assertTrue(expected)
        self.assertEqual(table_rows(section(self.rubric, "Scoring")), expected)

if __name__ == "__main__":
    unittest.main()
