import { describe, expect, test } from "bun:test";
import { readSiteKeyArguments } from "./readSiteKeyArguments";

describe("readSiteKeyArguments", () => {
  test("reads the name after the flag", () => {
    expect(readSiteKeyArguments(["--name", "web local"])).toEqual({
      name: "web local",
    });
  });

  test("returns no name without the flag or without a value", () => {
    expect(readSiteKeyArguments([]).name).toBeUndefined();
    expect(readSiteKeyArguments(["--name"]).name).toBeUndefined();
  });
});
