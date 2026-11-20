import { describe, expect, test } from "bun:test";
import { resolvePublishPath } from "./resolvePublishPath";

describe("resolvePublishPath", () => {
  test("publishes directly only with the permission and without mandatory review", () => {
    expect(resolvePublishPath(true, false)).toBe("direct");
    expect(resolvePublishPath(true, true)).toBe("reviewOnly");
    expect(resolvePublishPath(false, false)).toBe("reviewOnly");
    expect(resolvePublishPath(false, true)).toBe("reviewOnly");
  });
});
