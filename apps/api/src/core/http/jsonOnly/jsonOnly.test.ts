import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { jsonOnly } from "./jsonOnly";

const HTTP_OK = 200;
const HTTP_UNSUPPORTED_MEDIA_TYPE = 415;

const app = new Hono().use(jsonOnly).all("/", (c) => c.text("ok"));

function streamOf(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      if (text) controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

describe("jsonOnly", () => {
  test("a DELETE with an empty body stream and no headers passes (browser behind Next)", async () => {
    const request = new Request("http://test/", {
      method: "DELETE",
      body: streamOf(""),
      duplex: "half",
    } as RequestInit);
    expect((await app.request(request)).status).toBe(HTTP_OK);
  });

  test("a form post gets a 415", async () => {
    const response = await app.request("/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": "3",
      },
      body: "a=1",
    });
    expect(response.status).toBe(HTTP_UNSUPPORTED_MEDIA_TYPE);
  });

  test("a JSON body passes", async () => {
    const response = await app.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": "2" },
      body: "{}",
    });
    expect(response.status).toBe(HTTP_OK);
  });
});
