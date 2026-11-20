import { MAX_VISIT_FAQS } from "@ancla/contracts";
import type { FaqFormValues } from "../../types";

export type MoveDirection = "up" | "down";

/** Appends an empty FAQ; the list is returned untouched once it reaches the API limit. */
export function addFaq(faqs: readonly FaqFormValues[], key: string): FaqFormValues[] {
  if (faqs.length >= MAX_VISIT_FAQS) return [...faqs];
  return [...faqs, { key, questions: {}, answers: {} }];
}

export function removeFaq(faqs: readonly FaqFormValues[], key: string): FaqFormValues[] {
  return faqs.filter((faq) => faq.key !== key);
}

/** Swaps a FAQ with its neighbour; moving past either end leaves the order as it was. */
export function moveFaq(
  faqs: readonly FaqFormValues[],
  key: string,
  direction: MoveDirection,
): FaqFormValues[] {
  const index = faqs.findIndex((faq) => faq.key === key);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= faqs.length) return [...faqs];
  const next = [...faqs];
  const current = next[index];
  const neighbour = next[target];
  if (!current || !neighbour) return next;
  next[index] = neighbour;
  next[target] = current;
  return next;
}
