import { describe, expect, test } from "bun:test";
import { readSiteKeyArguments } from "./readSiteKeyArguments";

describe("readSiteKeyArguments", () => {
  test("reads the name after the flag", () => {
    expect(readSiteKeyArguments(["--name", "web local"]).name).toBe(
      "web local",
    );
  });

  test("returns no name without the flag or without a value", () => {
    expect(readSiteKeyArguments([]).name).toBeUndefined();
    expect(readSiteKeyArguments(["--name"]).name).toBeUndefined();
  });

  test("reads --write-env and --api-url", () => {
    const parsed = readSiteKeyArguments([
      "--name",
      "x",
      "--write-env",
      "--api-url",
      "http://localhost:3100",
    ]);
    expect(parsed.writeEnv).toBe(true);
    expect(parsed.apiUrl).toBe("http://localhost:3100");
    expect(readSiteKeyArguments(["--name", "x"]).writeEnv).toBe(false);
  });
});
