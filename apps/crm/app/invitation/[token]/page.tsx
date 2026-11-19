import { AuthFrame } from "../../components";
import { InvitationAccept } from "./components";

/** The token is the capability: the page itself is public and shows nothing until it is checked. */
export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <AuthFrame>
      <InvitationAccept token={token} />
    </AuthFrame>
  );
}
