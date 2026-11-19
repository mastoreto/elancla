import { AuthFrame, LoginForm } from "./components";

interface LoginPageProps {
  searchParams: Promise<{ error?: string; invited?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, invited, reset } = await searchParams;
  return (
    <AuthFrame>
      <LoginForm
        errorCode={error}
        invitationAccepted={invited === "1"}
        passwordReset={reset === "1"}
      />
    </AuthFrame>
  );
}
