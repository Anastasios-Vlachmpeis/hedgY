import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create account · Verso" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
