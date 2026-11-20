import { render } from "@react-email/render";
import type { ReactElement } from "react";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export async function renderBoth(
  subject: string,
  element: ReactElement,
): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { subject, html, text };
}
