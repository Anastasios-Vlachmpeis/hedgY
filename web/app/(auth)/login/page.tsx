import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in · Verso" };

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
