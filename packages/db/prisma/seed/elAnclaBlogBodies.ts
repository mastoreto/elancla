/*
 * Blog bodies of the dev seed, as Tiptap JSON. Texts come from the former content seeds
 * (`packages/content/src/blog.ts`); the contracts validate them when the seed runs.
 */

type Mark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "link"; attrs: { href: string } };
type Part = string | { text: string; marks: Mark[] };
type Inline = { type: "text"; text: string; marks?: Mark[] };

const bold = (text: string): Part => ({ text, marks: [{ type: "bold" }] });
const italic = (text: string): Part => ({ text, marks: [{ type: "italic" }] });
const link = (text: string, href: string): Part => ({
  text,
  marks: [{ type: "link", attrs: { href } }],
});

function inline(parts: Part[]): Inline[] {
  return parts.map((part) =>
    typeof part === "string"
      ? { type: "text", text: part }
      : { type: "text", text: part.text, marks: part.marks },
  );
}

const paragraph = (...parts: Part[]) => ({
  type: "paragraph",
  content: inline(parts),
});
const dropCapParagraph = (...parts: Part[]) => ({
  type: "paragraph",
  attrs: { dropCap: true },
  content: inline(parts),
});
const heading = (level: 2 | 3, text: string) => ({
  type: "heading",
  attrs: { level },
  content: inline([text]),
});
const verse = (reference: string, text: string) => ({
  type: "verse",
  attrs: { reference },
  content: inline([text]),
});
const pullquote = (text: string, cite: string) => ({
  type: "pullquote",
  attrs: { cite },
  content: inline([text]),
});
const note = (label: string, ...parts: Part[]) => ({
  type: "note",
  attrs: { label },
  content: [paragraph(...parts)],
});
const list = (type: "bulletList" | "orderedList", items: Part[][]) => ({
  type,
  content: items.map((parts) => ({
    type: "listItem",
    content: [paragraph(...parts)],
  })),
});
const doc = (...content: unknown[]) => ({ type: "doc", content });
const horizontalRule = { type: "horizontalRule" };

/**
 * The seed has no uploaded media, so this id points to no file: the public API leaves a figure
 * without media out. It only proves the node validates and is stored.
 */
export const SEED_FIGURE_MEDIA_ID = "00000000-0000-7000-8000-00000000f160";

export const ANCHOR_BODY = {
  es: doc(
    dropCapParagraph(
      "Hay textos del Nuevo Testamento que uno lee, asiente y olvida. Y hay otros que se quedan dando vueltas como una imagen vista al pasar por la calle. ",
      bold("Hebreos 6:19"),
      " es de los segundos. El autor no escribe un párrafo doctrinal: dibuja una escena. La esperanza, dice, es como un ancla.",
    ),
    heading(2, "Una imagen marina"),
    paragraph(
      "El autor de Hebreos escribe a una comunidad cansada. Han pasado los primeros años de entusiasmo, las amistades se han desgastado, algunos se han ido. Es a esa iglesia, no a otra, a la que se le habla de un ancla.",
    ),
    verse(
      "Hebreos 6 · 19-20",
      "La cual tenemos como segura y firme ancla del alma, y que penetra hasta dentro del velo, donde Jesús entró por nosotros como precursor.",
    ),
    paragraph(
      "Lo importante no es solo el ancla. Es ",
      italic("dónde"),
      " está clavada. El ancla atraviesa el velo y se afirma en la presencia misma de Dios.",
    ),
    {
      type: "figure",
      attrs: {
        mediaId: SEED_FIGURE_MEDIA_ID,
        alt: "El puerto de Montevideo al amanecer",
        caption: "Detalle del puerto de Montevideo.",
        aspect: "landscape",
      },
    },
    heading(2, "¿Por qué un ancla?"),
    list("bulletList", [
      [
        bold("El ancla trabaja debajo."),
        " Lo que sostiene a la iglesia rara vez es lo que se ve por afuera.",
      ],
      [
        bold("El ancla trabaja sola."),
        " No necesita que el barco la ayude; necesita que el barco confíe en ella.",
      ],
      [
        bold("El ancla se prueba en la tormenta."),
        " En la calma todo parece firme.",
      ],
    ]),
    pullquote(
      "No estamos llamados a producir la esperanza. Estamos llamados a recordarla, a confiar en ella, y a vivir como si fuera verdad.",
      "Notas del sermón, 13 · ABR · 2026",
    ),
    heading(3, "El sermón completo, en video"),
    {
      type: "video",
      attrs: {
        youtubeId: "dQw4w9WgXcQ",
        title: "El ancla del alma - Heb. 6",
        caption: "Predicado por Pr. Juan Olivera · Iglesia Bautista El Ancla.",
      },
    },
    heading(2, "La esperanza que no avergüenza"),
    paragraph(
      "Pablo escribirá algo parecido en ",
      link(
        "Romanos 5:5",
        "https://www.biblegateway.com/passage/?search=Romanos+5%3A5&version=RVR1960",
      ),
      ": la esperanza no avergüenza. La esperanza cristiana no promete que el mar se calme; promete que el ancla aguanta.",
    ),
    note(
      "Nota · Glosario",
      bold("Elpis."),
      " En griego, esperanza no es un deseo incierto sino una expectativa fundada.",
    ),
    heading(2, "Tres prácticas para esta semana"),
    list("orderedList", [
      [
        bold("Lectura diaria."),
        " Leé en voz alta Hebreos 6:13-20 cada mañana, durante siete días.",
      ],
      [
        bold("Una conversación."),
        " Compartí con alguien de la iglesia una situación en la que sentís que el ancla está siendo probada.",
      ],
      [bold("Una memoria."), " Aprendé el versículo 19 de memoria."],
    ]),
    heading(3, "Para seguir leyendo"),
    {
      type: "linkCards",
      attrs: {
        items: [
          {
            title: "El ancla que sostiene en cualquier tormenta",
            description:
              "Una meditación sobre Hebreos 6:19 y el carácter inquebrantable de la promesa de Dios.",
            href: "https://www.desiringgod.org",
            sourceLabel: "desiringgod.org",
          },
          {
            title: "La iglesia local como hogar de la esperanza",
            description:
              "Reflexiones desde el pastorado sobre esperanza cristiana en la vida ordinaria de una congregación.",
            href: "https://www.9marks.org",
            sourceLabel: "9marks.org",
          },
        ],
      },
    },
    horizontalRule,
    paragraph(
      "El próximo martes vamos a continuar la serie con un estudio sobre el sacerdocio de Cristo según Hebreos 7. Hasta entonces, que el ancla aguante.",
    ),
  ),
  en: doc(
    dropCapParagraph(
      "Some New Testament texts we read, nod at and forget. Others keep turning in our minds like an image seen in passing. ",
      bold("Hebrews 6:19"),
      " is one of the latter: hope, it says, is like an anchor.",
    ),
    heading(2, "A sea image"),
    verse(
      "Hebrews 6 · 19-20",
      "We have this hope as an anchor for the soul, firm and secure.",
    ),
    note(
      "Note · Glossary",
      bold("Elpis."),
      " In Greek, hope is not an uncertain wish but a grounded expectation.",
    ),
  ),
  pt: doc(
    dropCapParagraph(
      "Há textos do Novo Testamento que lemos, assentimos e esquecemos. Outros ficam dando voltas como uma imagem vista de passagem. ",
      bold("Hebreus 6:19"),
      " é um dos segundos: a esperança, diz, é como uma âncora.",
    ),
    heading(2, "Uma imagem marinha"),
    verse(
      "Hebreus 6 · 19-20",
      "Temos esta esperança como âncora da alma, segura e firme.",
    ),
  ),
};

/** Body of the Hebrews series entries; the structure follows the former editorial seed. */
export function seriesBody(excerpt: string, category: string): unknown {
  return doc(
    dropCapParagraph(
      `${excerpt} Esta entrega recoge la línea pastoral principal y preguntas útiles para conversar.`,
    ),
    heading(2, "El hilo principal"),
    paragraph(
      "Este recurso pertenece a la categoría ",
      bold(category),
      " y busca conectar la enseñanza bíblica con la vida ordinaria de la iglesia.",
    ),
    verse(
      "Hebreos 6 · 19",
      "Tenemos esta esperanza como firme y segura ancla del alma.",
    ),
    heading(2, "Preguntas para conversar"),
    list("bulletList", [
      ["¿Qué parte de este tema toca una situación concreta de tu semana?"],
      ["¿Qué promesa del evangelio necesitás recordar antes de actuar?"],
      ["¿Con quién podrías conversar u orar a partir de esta lectura?"],
    ]),
    horizontalRule,
    note(
      "Nota editorial",
      "Texto de ejemplo del seed de desarrollo: la iglesia carga el contenido real desde el CRM.",
    ),
  );
}
