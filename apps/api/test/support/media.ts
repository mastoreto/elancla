import path from "node:path";

const FIXTURES_DIR = path.resolve(import.meta.dir, "../fixtures/media");

/** The bytes of a file in `test/fixtures/media`. */
export async function readMediaFixture(
  name: string,
): Promise<Uint8Array<ArrayBuffer>> {
  return new Uint8Array(
    await Bun.file(path.join(FIXTURES_DIR, name)).arrayBuffer(),
  );
}
