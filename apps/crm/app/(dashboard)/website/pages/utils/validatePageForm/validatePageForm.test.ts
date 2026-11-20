import { describe, expect, test } from "bun:test";
import type { RichTextDoc } from "@ancla/contracts";
import type { PageFormValues } from "../../types";
import { EMPTY_BODY } from "../pageFormValues";
import { describeSlugProblem, hasPageFormErrors, validatePageForm } from "./validatePageForm";

const body: RichTextDoc = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Hola" }] }],
};

function blank() {
  return {
    title: "",
    slug: "",
    slugEdited: false,
    body: EMPTY_BODY,
    seoTitle: "",
    seoDescription: "",
  };
}

function valid(): PageFormValues {
  return { es: { ...blank(), title: "Hola", slug: "hola", body }, en: blank() };
}

describe("describeSlugProblem", () => {
  test("accepts a kebab-case slug", () => {
    expect(describeSlugProblem("politica-de-privacidad")).toBeNull();
  });

  test("rejects empty, malformed and reserved slugs", () => {
    expect(describeSlugProblem("")).not.toBeNull();
    expect(describeSlugProblem("Hola Mundo")).not.toBeNull();
    expect(describeSlugProblem("a--b")).not.toBeNull();
    expect(describeSlugProblem("blog")).toContain("reservado");
  });
});

describe("validatePageForm", () => {
  test("a complete default language is valid even with the others blank", () => {
    expect(hasPageFormErrors(validatePageForm(valid(), "es"))).toBe(false);
  });

  test("flags the missing title and slug of the default language", () => {
    const errors = validatePageForm({ es: blank(), en: blank() }, "es");
    expect(errors.es?.title).toBeDefined();
    expect(errors.es?.slug).toBeDefined();
    expect(errors.en).toBeUndefined();
  });

  test("flags a half-filled secondary language", () => {
    const values = valid();
    values.en = { ...blank(), title: "Hi" };
    const errors = validatePageForm(values, "es");
    expect(errors.en?.slug).toBeDefined();
    expect(errors.es).toBeUndefined();
  });

  test("flags an SEO description that is too long", () => {
    const values = valid();
    values.es = { ...values.es, seoDescription: "x".repeat(161) } as PageFormValues["es"];
    expect(validatePageForm(values, "es").es?.seoDescription).toBeDefined();
  });

  test("flags a link that is not http, https or mailto", () => {
    const values = valid();
    const bad: RichTextDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "x",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    };
    values.es = { ...values.es, body: bad } as PageFormValues["es"];
    expect(validatePageForm(values, "es").es?.body).toBeDefined();
  });
});
