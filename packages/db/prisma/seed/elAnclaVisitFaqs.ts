// Editable FAQ of /visitanos, as it was written in visit.json before 1.3c. The schedule and address
// questions are not here: the web generates them from the site settings.
// `{worshipEnd}` and `{email}` are filled in by the web when it renders the answer.

export interface VisitFaqSeed {
  readonly question: Readonly<Record<string, string>>;
  readonly answer: Readonly<Record<string, string>>;
}

export const EL_ANCLA_VISIT_FAQS: readonly VisitFaqSeed[] = [
  {
    question: {
      es: "¿Cuánto dura el culto?",
      en: "How long is the service?",
      pt: "Quanto tempo dura o culto?",
    },
    answer: {
      es: "Termina cerca de las {worshipEnd}. Si quieres, puedes quedarte a conversar después.",
      en: "It ends around {worshipEnd}. You are welcome to stay and chat afterwards.",
      pt: "Termina por volta das {worshipEnd}. Se quiser, pode ficar para conversar depois.",
    },
  },
  {
    question: {
      es: "¿Tengo que ser miembro o avisar que voy?",
      en: "Do I need to be a member or tell you I'm coming?",
      pt: "Preciso ser membro ou avisar que vou?",
    },
    answer: {
      es: "No. Cualquier persona puede venir, sin inscripción y sin compromiso.",
      en: "No. Anyone can come, with no sign-up and no commitment.",
      pt: "Não. Qualquer pessoa pode vir, sem inscrição e sem compromisso.",
    },
  },
  {
    question: {
      es: "¿Se puede tomar mate?",
      en: "Can I drink mate?",
      pt: "Posso tomar mate?",
    },
    answer: {
      es: "¡Sí! Te animamos a traer tu mate, y también algo para anotar, ya que muchas veces nos quedan ganas de apuntar lo que se enseña. Siéntete como en casa.",
      en: "Yes! We encourage you to bring your mate, and something to take notes with, since you may want to jot down what is taught. Make yourself at home.",
      pt: "Sim! Incentivamos você a trazer o seu mate, e também algo para anotar, pois muitas vezes dá vontade de registrar o que é ensinado. Sinta-se em casa.",
    },
  },
  {
    question: {
      es: "¿Hay código de vestimenta?",
      en: "Is there a dress code?",
      pt: "Existe código de vestimenta?",
    },
    answer: {
      es: "No es necesario venir de manera formal, pero sí te sugerimos un estilo sport casual: jean, cargo, remera polo, camisa o remera sport están perfectos. No es un código rígido, solo venir cómodo y prolijo.",
      en: "There's no need to dress formally, but we suggest a smart-casual style: jeans, cargo pants, a polo, a button-up shirt or a sport tee are all perfect. It's not a strict code, just come comfortable and neat.",
      pt: "Não é preciso vir formal, mas sugerimos um estilo esporte casual: jeans, calça cargo, camisa polo, camisa social ou camiseta esportiva estão ótimos. Não é um código rígido, basta vir confortável e arrumado.",
    },
  },
  {
    question: {
      es: "¿Qué cree la Iglesia Bautista El Ancla?",
      en: "What does El Ancla Baptist Church believe?",
      pt: "Em que a Igreja Batista El Ancla acredita?",
    },
    answer: {
      es: "Somos una iglesia bautista centrada en el evangelio de Jesucristo. Nuestra doctrina está explicada en la confesión de fe.",
      en: "We are a Baptist church centered on the gospel of Jesus Christ. Our doctrine is explained in the statement of faith.",
      pt: "Somos uma igreja batista centrada no evangelho de Jesus Cristo. Nossa doutrina está explicada na confissão de fé.",
    },
  },
  {
    question: {
      es: "¿Puedo ver el culto sin ir?",
      en: "Can I watch the service without coming?",
      pt: "Posso assistir ao culto sem ir?",
    },
    answer: {
      es: "Sí. Transmitimos en vivo por YouTube y las prédicas quedan disponibles en la sección de sermones.",
      en: "Yes. We stream live on YouTube and sermons stay available in the sermons section.",
      pt: "Sim. Transmitimos ao vivo pelo YouTube e as pregações ficam disponíveis na seção de sermões.",
    },
  },
  {
    question: {
      es: "¿Cómo me comunico con la iglesia?",
      en: "How can I contact the church?",
      pt: "Como entro em contato com a igreja?",
    },
    answer: {
      es: "Escribiendo a {email} o por nuestras redes en YouTube, Instagram y Facebook.",
      en: "Write to {email} or find us on YouTube, Instagram and Facebook.",
      pt: "Escrevendo para {email} ou pelas nossas redes no YouTube, Instagram e Facebook.",
    },
  },
];
