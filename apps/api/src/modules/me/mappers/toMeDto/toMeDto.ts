import type { MeDto, SignInMethod } from "@ancla/contracts";
import type { SessionUser } from "../../../../core/context";
import type { AccountSnapshot } from "../../data";

const CREDENTIAL_PROVIDER_ID = "credential";
const GOOGLE_PROVIDER_ID = "google";

/** A credential account without a password hash is not a usable sign-in method. */
function toMethods(accounts: AccountSnapshot["accounts"]): SignInMethod[] {
  const methods: SignInMethod[] = [];
  if (
    accounts.some((a) => a.providerId === CREDENTIAL_PROVIDER_ID && a.password)
  ) {
    methods.push("password");
  }
  if (accounts.some((a) => a.providerId === GOOGLE_PROVIDER_ID))
    methods.push("google");
  return methods;
}

/** Explicit field list: anything else on the user never reaches the response. */
export function toMeDto(user: SessionUser, snapshot: AccountSnapshot): MeDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: snapshot.image,
    methods: toMethods(snapshot.accounts),
    twoFactorEnabled: snapshot.twoFactorEnabled,
  };
}
