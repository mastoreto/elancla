import { describe, expect, test } from "bun:test";
import { matchRouteRule } from "@/lib/authz/matchRouteRule";
import { churchToDashboardRouteMap } from "@/lib/church";
import { navigationSections } from "./app-sidebar";

const CHURCH_PREFIX = "/el-ancla/";

describe("sidebar navigation", () => {
  test("every linked section has a route rule, so the proxy can authorize it", () => {
    const urls = navigationSections.flatMap((section) =>
      section.items.flatMap((item) =>
        item.type === "link" ? [item.url] : item.items.flatMap((sub) => (sub.url ? [sub.url] : [])),
      ),
    );
    expect(urls.length).toBeGreaterThan(10);
    for (const url of urls) {
      const [church] = url.replace(CHURCH_PREFIX, "").split("/");
      const internal = churchToDashboardRouteMap[church as keyof typeof churchToDashboardRouteMap];
      expect({ url, rule: matchRouteRule(`/${internal}`) !== undefined }).toEqual({
        url,
        rule: true,
      });
    }
  });
});
