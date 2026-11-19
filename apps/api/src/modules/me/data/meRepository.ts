import { db } from "@ancla/db";

/** Account facts that are not part of the session payload. */
export function findAccountSnapshot(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      image: true,
      twoFactorEnabled: true,
      accounts: { select: { providerId: true, password: true } },
    },
  });
}

export type AccountSnapshot = NonNullable<
  Awaited<ReturnType<typeof findAccountSnapshot>>
>;
