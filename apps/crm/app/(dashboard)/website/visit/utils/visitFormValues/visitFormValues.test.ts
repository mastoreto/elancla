import { describe, expect, test } from "bun:test";
import type { VisitContentDto } from "@ancla/contracts";
import { toUpdateVisitBody, toVisitFormValues } from "./visitFormValues";

const LOCALES = ["es", "en"];
const FAQ_ID_A = "0b6f8f6e-6a0c-4f5c-9d8e-111111111111";
const FAQ_ID_B = "0b6f8f6e-6a0c-4f5c-9d8e-222222222222";

const content: VisitContentDto = {
  locales: LOCALES,
  defaultLocale: "es",
  directions: {
    es: { parking: "Calle lateral", transit: null, accessibility: "Rampa" },
  },
  faqs: [
    {
      id: FAQ_ID_B,
      order: 1,
      translations: { es: { question: "Segunda", answer: "Respuesta 2" } },
    },
    {
      id: FAQ_ID_A,
      order: 0,
      translations: {
        es: { question: "Primera", answer: "Respuesta 1" },
        en: { question: "First", answer: "Answer 1" },
      },
    },
  ],
};

describe("toVisitFormValues", () => {
  test("orders the FAQs and fills every locale of every direction", () => {
    const values = toVisitFormValues(content);
    expect(values.faqs.map((faq) => faq.key)).toEqual([FAQ_ID_A, FAQ_ID_B]);
    expect(values.faqs[0]?.questions).toEqual({ es: "Primera", en: "First" });
    expect(values.directions.parking).toEqual({ es: "Calle lateral", en: "" });
    expect(values.directions.transit).toEqual({ es: "", en: "" });
  });
});

describe("toUpdateVisitBody", () => {
  test("round-trips the loaded content", () => {
    const body = toUpdateVisitBody(toVisitFormValues(content), LOCALES);
    expect(body.directions.es).toEqual({
      parking: "Calle lateral",
      transit: null,
      accessibility: "Rampa",
    });
    expect(body.directions.en).toEqual({ parking: null, transit: null, accessibility: null });
    expect(body.faqs).toHaveLength(2);
    expect(Object.keys(body.faqs[0]?.translations ?? {})).toEqual(["es", "en"]);
    expect(Object.keys(body.faqs[1]?.translations ?? {})).toEqual(["es"]);
  });

  test("trims, drops blank languages and keeps the array order", () => {
    const body = toUpdateVisitBody(
      {
        directions: {
          parking: { es: "  ", en: " Lot " },
          transit: {},
          accessibility: {},
        },
        faqs: [
          { key: "x", questions: { es: " ¿Hola? ", en: "  " }, answers: { es: " Sí ", en: "" } },
          { key: "y", questions: { es: "Otra" }, answers: { es: "Resp" } },
        ],
      },
      LOCALES,
    );
    expect(body.directions.es?.parking).toBeNull();
    expect(body.directions.en?.parking).toBe("Lot");
    expect(body.faqs[0]?.translations).toEqual({ es: { question: "¿Hola?", answer: "Sí" } });
    expect(body.faqs[1]?.translations.es?.question).toBe("Otra");
  });
});
