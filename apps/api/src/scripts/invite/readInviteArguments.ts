interface InviteArguments {
  email: string | undefined;
  role: string | undefined;
}

/** Parses `<email> [--role admin|viewer]` in any order. */
export function readInviteArguments(argv: readonly string[]): InviteArguments {
  const roleFlag = argv.indexOf("--role");
  const roleIndex = roleFlag === -1 ? -1 : roleFlag + 1;
  const role = roleIndex === -1 ? undefined : argv[roleIndex];
  const email = argv.find(
    (arg, index) => !arg.startsWith("--") && index !== roleIndex,
  );
  return { email, role };
}
