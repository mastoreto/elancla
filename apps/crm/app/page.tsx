import { cn } from "@/lib/utils";
import { LoginForm, LoginHero } from "./components";

const loginPage = {
  main: cn("min-h-svh bg-[var(--canvas)] p-0 md:p-8"),
  frame: cn(
    "flex min-h-svh gap-2.5 bg-background p-0 md:min-h-[calc(100svh-4rem)] md:rounded-[40px] md:p-2.5",
    "md:shadow-(--sombra-flotante)",
  ),
  formPane: cn("flex flex-[0.8] items-center justify-center p-6 md:p-[30px]"),
};

export default function LoginPage() {
  return (
    <main className={loginPage.main}>
      <div className={loginPage.frame}>
        <LoginHero />
        <div className={loginPage.formPane}>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
