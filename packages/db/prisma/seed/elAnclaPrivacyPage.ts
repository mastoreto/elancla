/** Example text only: the church loads the real privacy policy from the CRM before 1.9. */
function paragraph(text: string) {
  return { type: "paragraph", content: [{ type: "text", text }] };
}

function heading(text: string) {
  return {
    type: "heading",
    attrs: { level: 2 },
    content: [{ type: "text", text }],
  };
}

function body(sections: { title: string; text: string }[]) {
  return {
    type: "doc",
    content: sections.flatMap(({ title, text }) => [
      heading(title),
      paragraph(text),
    ]),
  };
}

export const EL_ANCLA_PRIVACY_PAGE = {
  translations: {
    es: {
      title: "Política de privacidad",
      slug: "privacidad",
      seoDescription:
        "Cómo cuidamos y usamos los datos personales de quienes nos visitan.",
      body: body([
        {
          title: "Qué datos recibimos",
          text: "Texto de ejemplo: los datos que nos dejás en los formularios del sitio.",
        },
        {
          title: "Para qué los usamos",
          text: "Texto de ejemplo: responder tu consulta y, si lo pedís, enviarte novedades.",
        },
      ]),
    },
    en: {
      title: "Privacy policy",
      slug: "privacy",
      seoDescription:
        "How we look after and use the personal data of people who visit us.",
      body: body([
        {
          title: "What data we receive",
          text: "Sample text: the data you leave in the forms of this site.",
        },
        {
          title: "What we use it for",
          text: "Sample text: answering your message and, if you ask, sending you news.",
        },
      ]),
    },
    pt: {
      title: "Política de privacidade",
      slug: "privacidade",
      seoDescription:
        "Como cuidamos e usamos os dados pessoais de quem nos visita.",
      body: body([
        {
          title: "Que dados recebemos",
          text: "Texto de exemplo: os dados que você deixa nos formulários do site.",
        },
        {
          title: "Para que os usamos",
          text: "Texto de exemplo: responder à sua mensagem e, se você pedir, enviar novidades.",
        },
      ]),
    },
  },
};
