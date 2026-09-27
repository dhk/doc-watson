# Construction rules

- README order: title, one-sentence value, status, quickstart, usage, deeper-doc links, contributing/maintenance, licence. The approved proposal wins where it says otherwise; note any deviation in the delivery report.
- Keep the quickstart to the shortest supported path. Put matrices and troubleshooting in install or guide docs.
- Organize depth by reader job: guides for tasks; reference for facts; architecture for mental models and rationale.
- Use present tense for current behavior and explicit future labels for plans.
- Keep agent memory short, operational, mutable, and linked to canonical human docs.
- Write ADRs only for real tradeoffs. Accepted ADRs are superseded, not rewritten.
- Use relative links for repository files. Use stable canonical URLs for published surfaces.
- Prefer Mermaid over binary diagrams. Include accessible prose describing every diagram's conclusion.
- Remove machine-specific paths, real secrets, personal addresses, and synthetic examples that look real.
- Retain provenance labels in audit and delivery artifacts, not in public-facing prose. Where a reader needs to know that a fact is the owner's decision rather than something the code shows, say so in words ("The owner does not invite outside contributions"), without evidence labels.
- When a target repository documents Doc Watson's link check, cite it by its stable URL (`https://github.com/dhk/doc-watson/blob/main/skills/repo-doc-construct/scripts/check_docs.py`), not a local path.
