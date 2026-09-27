import { readFile } from "node:fs/promises";
import path from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { STANDARD_VERSION } from "../src/types.js";

const root = path.join(import.meta.dirname, "..");
const read = (file: string) => readFile(path.join(root, file), "utf8");

function section(text: string, heading: string): string {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `^#+ ${escaped}\\n([\\s\\S]*?)(?=^#+ |(?![\\s\\S]))`,
    "m",
  ).exec(text);
  if (match?.[1] === undefined) throw new Error(`missing section: ${heading}`);
  return match[1];
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function load() {
  const standard = await read("docs/standard.md");
  const schema = JSON.parse(await read("schemas/enrollment.schema.json"));
  const template = parse(await read("templates/doc-watson.template.yml"));
  const validate = new Ajv2020({ allErrors: true }).compile(schema);
  return { standard, schema, template, validate };
}

describe("enrollment", () => {
  it("the template is valid and pins the current standard", async () => {
    const { template, validate } = await load();
    expect(validate(template), JSON.stringify(validate.errors)).toBe(true);
    expect(template.standard).toBe(STANDARD_VERSION);
  });

  it("the template also validates under YAML 1.1 parsing, and an unquoted date does not", async () => {
    const { validate } = await load();
    const text = await read("templates/doc-watson.template.yml");
    const asYaml11 = parse(text, { version: "1.1" });
    expect(validate(asYaml11), JSON.stringify(validate.errors)).toBe(true);
    const unquoted = parse(
      text.replace('date: "2026-01-01"', "date: 2026-01-01"),
      {
        version: "1.1",
      },
    );
    expect(validate(unquoted)).toBe(false);
  });

  it("trigger IDs match the standard, one per trigger rule", async () => {
    const { standard, schema } = await load();
    const table =
      standard.split("| ID | Trigger rule |")[1]?.split("\n\n")[0] ?? "";
    const ids = [...table.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]);
    const rules = section(standard, "Trigger rules").match(/^- /gm) ?? [];
    expect(ids).toHaveLength(rules.length);
    expect(schema.properties.triggers.required).toEqual(ids);
  });

  it("exemptable concern IDs are the standard's concerns minus the three that cannot be exempted", async () => {
    const { standard, schema } = await load();
    const concerns = [
      ...section(standard, "Audit concerns").matchAll(/^\d+\. (.+)$/gm),
    ].map((m) => slug(m[1] ?? ""));
    const blocked = [
      "truthfulness",
      "hygiene-and-duplication",
      "maintenance-and-verification",
    ];
    expect(concerns).toEqual(expect.arrayContaining(blocked));
    expect(schema.$defs.exemption.properties.concern.enum).toEqual(
      concerns.filter((id) => !blocked.includes(id)),
    );
  });

  it("rejects a missing trigger, an unexemptable concern and an unquoted numeric revision", async () => {
    const { template, validate } = await load();
    const withoutTrigger = structuredClone(template);
    delete withoutTrigger.triggers.runbooks;
    expect(validate(withoutTrigger)).toBe(false);

    const badExemption = structuredClone(template);
    badExemption.exemptions = [{ concern: "truthfulness", reason: "r" }];
    expect(validate(badExemption)).toBe(false);

    const numericRevision = parse(
      (await read("templates/doc-watson.template.yml")).replace(
        'revision: "0000000"',
        "revision: 1234567",
      ),
    );
    expect(validate(numericRevision)).toBe(false);
  });
});
