import { CALENDAR_ORDER_MAX } from "@ancla/contracts";

export const ORDER_MESSAGE = `Un número entero entre 0 y ${CALENDAR_ORDER_MAX}.`;
const ORDER_PATTERN = /^\d{1,4}$/;

/** The order typed in a form, or `null` when it is not an integer in the allowed range. */
export function parseOrder(text: string): number | null {
  const trimmed = text.trim();
  if (!ORDER_PATTERN.test(trimmed)) return null;
  const order = Number(trimmed);
  return order <= CALENDAR_ORDER_MAX ? order : null;
}

/** The order a new entity starts with: after the existing ones. */
export function nextOrderAfter(orders: readonly number[]): number {
  return orders.reduce((highest, order) => Math.max(highest, order + 1), 0);
}
