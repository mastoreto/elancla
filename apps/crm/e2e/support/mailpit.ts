const MAILPIT_API = "http://localhost:8025/api/v1";
const POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 500;

interface MailpitSearch {
  messages: { ID: string }[];
}

interface MailpitMessage {
  Text: string;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mailpit answered ${response.status} for ${url}`);
  return (await response.json()) as T;
}

/** Text body of the newest message sent to the address; waits for delivery. */
export async function latestMailTo(email: string): Promise<string> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const found = await getJson<MailpitSearch>(
      `${MAILPIT_API}/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    const [newest] = found.messages;
    if (newest) return (await getJson<MailpitMessage>(`${MAILPIT_API}/message/${newest.ID}`)).Text;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`No email to ${email} reached Mailpit`);
}

/** First link in the message that contains the given path fragment. */
export function findLink(text: string, pathFragment: string): string {
  const link = text.match(new RegExp(`https?://[^\\s<>"]*${pathFragment}[^\\s<>"]*`))?.[0];
  if (!link) throw new Error(`The email has no link containing ${pathFragment}`);
  return link;
}

/** Removes what Mailpit holds for the address, so the next wait cannot find an older message. */
export async function clearMailTo(email: string): Promise<void> {
  const response = await fetch(`${MAILPIT_API}/search?query=${encodeURIComponent(`to:${email}`)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Mailpit answered ${response.status} when clearing ${email}`);
}
