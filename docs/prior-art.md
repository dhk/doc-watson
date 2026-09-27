# Prior art and provenance

Doc Watson consolidates work developed before this repository existed.

## DHK repository documentation standard

Levels, trigger rules, Diátaxis mapping, C4/ADR guidance, agent-memory and
machine-contract distinctions, and hygiene findings were adapted from
`dhk/labs`' `docs/repo-documentation-standard.md` and `templates/repo-docs/`,
inspected locally on 2026-08-22.

That brief synthesized public prior art including
[standard-readme](https://github.com/RichardLitt/standard-readme),
[Make a README](https://www.makeareadme.com/),
[GitHub community health guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions),
[Diátaxis](https://diataxis.fr/), [C4](https://c4model.com/),
[ADRs](https://adr.github.io/), and [Google SRE](https://sre.google/workbook/on-call/).

Doc Watson restates the operational rules it needs rather than copying the
research brief. Future normative changes belong in [`standard.md`](standard.md);
Labs remains historical evidence, not a second mutable authority.

## Audit case studies

The workflow and artifact model were adapted from two 2026 case studies:

- `dhk/labs`: rich documentation islands without a usable front door;
- a third-party .NET/Blazor codebase (private engagement, not named): separate
  internal-use and handover proposals.

They established that documentation quality is navigation and truthful status,
a template is not evidence, an audit states where evidence stops, different
audiences may need different after-states, and deliberate omissions matter.

Original artifacts remain in their source workspace rather than being copied
here into a competing authority.

## Name

“Doc Watson” invokes Dr John H. Watson as investigator's companion and
chronicler: observe carefully, distinguish evidence from inference, and make a
technical account intelligible. It is a metaphor, not an affiliation.
