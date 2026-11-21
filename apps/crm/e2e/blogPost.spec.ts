import type { Browser, Locator, Page } from "@playwright/test";
import { clientAddressHeaders, E2E_USERS, expect, login, test, WEB_URL } from "./support";

const BLOG_ROUTE = "/el-ancla/blog";
const TAXONOMY_ROUTE = `${BLOG_ROUTE}/taxonomy`;
const PEOPLE_NEW_ROUTE = "/el-ancla/website/people/new";
const SETTINGS_URL = "/el-ancla/settings?tab=editorial";
const HTTP_OK = 200;
const HTTP_NOT_FOUND = 404;
const WEB_POLL_TIMEOUT_MS = 15_000;
const TEST_TIMEOUT_MS = 120_000;
const SCHEDULED_DAYS_AHEAD = 3;
const MILLISECONDS_PER_DAY = 86_400_000;
const YOUTUBE_ID = "dQw4w9WgXcQ";
const E2E_EDITOR_NAME = "E2E Editor";

/** Every title, slug and name carries the run id, so reruns never collide with earlier posts. */
const RUN_ID = Date.now().toString(36);
const CATEGORY_NAME = `Categoria e2e ${RUN_ID}`;
const AUTHOR_NAME = `Autor e2e ${RUN_ID}`;
const LINK_CARD_HREF = "https://example.com/e2e";
const VERSE_TEXT = `La fe es la certeza ${RUN_ID}`;
const VERSE_REFERENCE = `Hebreos 11:${RUN_ID.length}`;

interface PostDraft {
  title: string;
  slug: string;
  /** `datetime-local` value; empty publishes as soon as it is approved. */
  publishAt?: string;
  withBlocks?: boolean;
}

function draftOf(label: string, options: Partial<PostDraft> = {}): PostDraft {
  const title = `Articulo ${label} ${RUN_ID}`;
  return { title, slug: `articulo-${label}-${RUN_ID}`, ...options };
}

/** A `datetime-local` value some days from now. */
function daysFromNow(days: number): string {
  const date = new Date(Date.now() + days * MILLISECONDS_PER_DAY);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:00`;
}

async function createCategory(page: Page): Promise<void> {
  await page.goto(TAXONOMY_ROUTE);
  await page.getByTestId("category-new").click();
  await page.getByTestId("category-name").fill(CATEGORY_NAME);
  await page.getByTestId("category-save").click();
  await expect(page.getByText("Categoría creada")).toBeVisible();
}

async function createAuthor(page: Page): Promise<void> {
  await page.goto(PEOPLE_NEW_ROUTE);
  await page.locator("#person-name").fill(AUTHOR_NAME);
  await page.locator("#person-blog-author-title-es").fill("Pastor invitado");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page).toHaveURL(/\/website\/people$/);
}

async function pickOption(page: Page, trigger: string, name: string): Promise<void> {
  await page.locator(trigger).click();
  await page.getByRole("option", { name }).click();
}

/** Inserts a verse, writes its text and leaves it with Enter, which starts a normal paragraph. */
async function insertVerse(page: Page, body: Locator): Promise<void> {
  await page.getByTitle("Versículo").click();
  await page.getByLabel("Referencia").fill(VERSE_REFERENCE);
  await page.getByRole("dialog").getByRole("button", { name: "Insertar" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  // Closing the dialog hands the focus back to the toolbar button.
  await body.focus();
  await page.keyboard.type(VERSE_TEXT);
  await page.keyboard.press("Enter");
}

async function insertVideo(page: Page): Promise<void> {
  await page.getByTitle("Video de YouTube").click();
  await page.getByLabel("Enlace de YouTube").fill(`https://www.youtube.com/watch?v=${YOUTUBE_ID}`);
  await page.getByLabel("Título del video").fill("Un video de prueba");
  await page.getByRole("dialog").getByRole("button", { name: "Insertar" }).click();
}

/** Inserts one link card right after the video: consecutive atoms must not replace each other. */
async function insertLinkCard(page: Page): Promise<void> {
  await page.getByTitle("Tarjetas de enlaces").click();
  await page.getByRole("dialog").getByLabel("Título").first().fill("Un enlace");
  await page.getByRole("dialog").getByLabel("Enlace", { exact: true }).first().fill(LINK_CARD_HREF);
  await page.getByRole("dialog").getByRole("button", { name: "Insertar" }).click();
}

/** Creates a post from the list, fills the Spanish content and saves it as a draft. */
async function createPostDraft(page: Page, draft: PostDraft): Promise<string> {
  await page.goto(BLOG_ROUTE);
  await page.getByTestId("new-post-button").click();
  await expect(page).toHaveURL(new RegExp(`${BLOG_ROUTE}/[0-9a-f-]{36}$`));
  const postUrl = page.url();

  await page.getByTestId("post-title").fill(draft.title);
  // The slug follows the title until it is edited by hand.
  await page.getByTestId("post-slug").fill(draft.slug);
  await page.getByTestId("post-excerpt").fill("Un extracto de prueba.");
  const body = page.getByTestId("post-body").locator(".ProseMirror");
  await body.fill(`Contenido de prueba ${RUN_ID}`);
  if (draft.withBlocks) {
    await insertVerse(page, body);
    await insertVideo(page);
    await insertLinkCard(page);
  }

  await pickOption(page, "#post-author", AUTHOR_NAME);
  await pickOption(page, "#post-category", CATEGORY_NAME);
  if (draft.publishAt) await page.getByTestId("post-publish-at").fill(draft.publishAt);

  await page.getByTestId("post-save-draft").click();
  await expect(page.getByText("Borrador guardado")).toBeVisible();
  return postUrl;
}

async function webText(page: Page, route: string): Promise<string> {
  return (await page.request.get(`${WEB_URL}${route}`)).text();
}

/** The web caches for a moment (SITE_CONFIG_TTL_MS): poll the index until it links the post. */
async function waitForPostLink(page: Page, slug: string): Promise<string> {
  const linkPattern = new RegExp(`/blog/\\d{4}/\\d{2}/\\d{2}/${slug}(?=["?#])`);
  await expect
    .poll(async () => linkPattern.test(await webText(page, "/blog")), {
      timeout: WEB_POLL_TIMEOUT_MS,
    })
    .toBe(true);
  const match = (await webText(page, "/blog")).match(linkPattern);
  if (!match) throw new Error(`The blog index does not link ${slug}`);
  return match[0];
}

async function webStatus(page: Page, route: string): Promise<number> {
  return (await page.request.get(`${WEB_URL}${route}`)).status();
}

async function postRow(page: Page, title: string): Promise<Locator> {
  await page.goto(BLOG_ROUTE);
  return page.getByTestId("post-row").filter({ hasText: title });
}

/** Opens the article as a reader would, scrolls past half of it and waits for the view beacon. */
async function readArticle(browser: Browser, route: string): Promise<void> {
  const context = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const reader = await context.newPage();
  await reader.goto(`${WEB_URL}${route}`);
  const beacon = reader.waitForResponse((response) => response.url().endsWith("/api/views"));
  await reader.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  expect((await beacon).status()).toBe(204);
  await context.close();
}

async function setMandatoryReviewOfEditor(page: Page, required: boolean): Promise<void> {
  await page.goto(SETTINGS_URL);
  const blogCard = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Blog", exact: true }) });
  await blogCard
    .getByRole("group", { name: "Personas con revisión obligatoria", exact: true })
    .getByLabel(E2E_EDITOR_NAME)
    .setChecked(required);
  await blogCard.getByRole("button", { name: "Guardar Blog" }).click();
  await expect(page.getByText("Revisión editorial guardada")).toBeVisible();
}

test.describe.configure({ mode: "serial", timeout: TEST_TIMEOUT_MS });

test("a published post shows on the web with its nodes and counts one view; scheduled and paused ones do not", async ({
  page,
  browser,
}) => {
  await login(page, E2E_USERS.admin);
  await createCategory(page);
  await createAuthor(page);

  // A post scheduled for the future is published but must not be visible yet.
  const scheduled = draftOf("programado", { publishAt: daysFromNow(SCHEDULED_DAYS_AHEAD) });
  await createPostDraft(page, scheduled);
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Contenido publicado")).toBeVisible();

  // The admin needs no review: publishing goes straight through.
  const post = draftOf("publicado", { withBlocks: true });
  await createPostDraft(page, post);
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Contenido publicado")).toBeVisible();

  const articleRoute = await waitForPostLink(page, post.slug);
  const index = await webText(page, "/blog");
  expect(index).not.toContain(scheduled.slug);
  await expect
    .poll(() => webStatus(page, articleRoute), { timeout: WEB_POLL_TIMEOUT_MS })
    .toBe(HTTP_OK);
  const article = await webText(page, articleRoute);
  expect(article).toContain(post.title);
  expect(article).toContain(VERSE_REFERENCE);
  expect(article).toContain(VERSE_TEXT);
  expect(article).toContain(`youtube-nocookie.com/embed/${YOUTUBE_ID}`);
  expect(article).toContain(`href="${LINK_CARD_HREF}"`);

  // Two readers in the same day, from the same address and browser: one view.
  await readArticle(browser, articleRoute);
  await readArticle(browser, articleRoute);
  const row = await postRow(page, post.title);
  await expect
    .poll(
      async () => {
        await page.reload();
        return row.getByTitle("Vistas en 30 días").innerText();
      },
      { timeout: WEB_POLL_TIMEOUT_MS },
    )
    .toBe("1");

  // Pausing takes it off the web (the content stays in the CRM).
  await row.click();
  await page.getByRole("button", { name: "Pausar" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Pausar" }).click();
  await expect(page.getByText("Contenido pausado")).toBeVisible();
  await expect
    .poll(() => webStatus(page, articleRoute), { timeout: WEB_POLL_TIMEOUT_MS })
    .toBe(HTTP_NOT_FOUND);
});

test("an editor under mandatory review sends the post to review and the admin's approval publishes it", async ({
  page,
  browser,
}) => {
  await login(page, E2E_USERS.admin);
  await setMandatoryReviewOfEditor(page, true);

  const post = draftOf("revision");
  const editorContext = await browser.newContext({ extraHTTPHeaders: clientAddressHeaders() });
  const editorPage = await editorContext.newPage();
  await login(editorPage, E2E_USERS.editor);
  const postUrl = await createPostDraft(editorPage, post);

  // Under mandatory review there is no "Publicar": only the way to review.
  await expect(editorPage.getByRole("button", { name: "Publicar" })).toHaveCount(0);
  await editorPage.getByRole("button", { name: "Enviar a revisión" }).click();
  await expect(editorPage.getByText("Enviado a revisión")).toBeVisible();
  await editorContext.close();
  expect(await webText(page, "/blog")).not.toContain(post.slug);

  // The admin approves it from the same screen and it shows up on the web.
  await page.goto(postUrl);
  await page.getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Contenido aprobado y publicado")).toBeVisible();
  await waitForPostLink(page, post.slug);

  // Leave the review settings as found.
  await setMandatoryReviewOfEditor(page, false);
});
