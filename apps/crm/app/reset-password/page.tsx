import { AuthFrame } from "../components";
import { ResetPasswordForm } from "./components";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, error } = await searchParams;
  return (
    <AuthFrame>
      <ResetPasswordForm errorCode={error} token={token} />
    </AuthFrame>
  );
}
