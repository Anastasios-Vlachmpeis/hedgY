"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

type Mode = "signin" | "signup";

// MVP demo credentials: sign in with these to reach the dashboard.
const DEMO_EMAIL = "1234@gmail.com";
const DEMO_PASSWORD = "1234";

// Accent palette (purple, matches the pastel showcase panel).
const TEAL = "#8B7CFF";
const TEAL_HOVER = "#7A6BF0";
const TEAL_TEXT = "#8B7CFF";

const COPY: Record<
  Mode,
  { title: string; verb: string; cta: string; altText: string; altLink: string; altHref: string }
> = {
  signin: {
    title: "Welcome back",
    verb: "Sign in",
    cta: "Sign in",
    altText: "Don't have an account?",
    altLink: "Sign up",
    altHref: "/signup",
  },
  signup: {
    title: "Create your account",
    verb: "Sign up",
    cta: "Create account",
    altText: "Already have an account?",
    altLink: "Log in",
    altHref: "/login",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const copy = COPY[mode];
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");

    // Sign-in is gated on the demo credentials; sign-up is open so neither CTA
    // is a dead end. Either way, a successful submit lands on the dashboard.
    if (mode === "signin" && (email !== DEMO_EMAIL || password !== DEMO_PASSWORD)) {
      setError("Invalid email or password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setDone(true);
      router.push("/dashboard");
    }, 700);
  }

  return (
    <div className="w-full">
      <h1 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-[#181925]">
        {copy.title}
      </h1>
      <p className="mt-2 text-center text-[14px] text-[#666666]">
        {copy.altText}{" "}
        <Link
          href={copy.altHref}
          className="font-semibold hover:underline"
          style={{ color: TEAL_TEXT }}
        >
          {copy.altLink}
        </Link>
      </p>

      {/* SSO providers */}
      <div className="mt-8 flex flex-col gap-2.5">
        <SsoButton label={`${copy.verb} with Google`} icon={<GoogleIcon />} />
        <SsoButton label={`${copy.verb} with Apple`} icon={<AppleIcon />} />
        <SsoButton label={`${copy.verb} with GitHub`} icon={<GitHubIcon />} />
        <SsoButton label={`${copy.verb} with SSO`} />
      </div>

      {/* divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ececec]" />
        <span className="text-[12px] text-[#a3a3a3]">OR</span>
        <div className="h-px flex-1 bg-[#ececec]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <Input
            name="name"
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        )}

        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[13px] font-medium text-[#3f3f46]">
              Password
            </label>
            {mode === "signin" && (
              <Link
                href="/forgot-password"
                className="text-[13px] font-medium hover:underline"
                style={{ color: TEAL_TEXT }}
              >
                Forgot password
              </Link>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••••••"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </div>

        {error && (
          <p role="alert" className="text-[13px] font-medium text-[#dc2626]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || done}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-all active:translate-y-px disabled:opacity-60"
          style={{ backgroundColor: TEAL }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL)}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Please wait…
            </>
          ) : done ? (
            "Success ✓"
          ) : (
            copy.cta
          )}
        </button>
      </form>
    </div>
  );
}

function SsoButton({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#e2e2e2] bg-white text-[14px] font-medium text-[#181925] transition-colors hover:bg-[#f7f7f7]"
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="#181925" aria-hidden>
      <path d="M16.37 1.43c0 1.07-.4 2.09-1.1 2.85-.8.9-2.1 1.6-3.18 1.5-.13-1.04.4-2.16 1.04-2.86.73-.8 2.05-1.4 3.24-1.49ZM20.5 17.2c-.58 1.33-.86 1.92-1.6 3.1-1.04 1.64-2.5 3.68-4.32 3.7-1.6.01-2.02-1.05-4.2-1.04-2.18.01-2.64 1.06-4.25 1.04-1.8-.02-3.18-1.86-4.23-3.5C-1.06 16.6-1.35 11.1 1.12 8.16 2.26 6.79 4.05 5.93 5.73 5.93c1.7 0 2.77 1.05 4.18 1.05 1.36 0 2.19-1.05 4.16-1.05 1.5 0 3.07.81 4.2 2.21-3.69 2.02-3.09 7.29.7 8.76Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-[18px]" viewBox="0 0 24 24" fill="#181925" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2.1c-3.34.71-4.04-1.4-4.04-1.4-.55-1.36-1.34-1.72-1.34-1.72-1.09-.72.08-.71.08-.71 1.2.08 1.83 1.21 1.83 1.21 1.07 1.78 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.3-5.47-5.79 0-1.28.47-2.33 1.24-3.15-.13-.3-.54-1.5.12-3.13 0 0 1.01-.32 3.3 1.2a11.6 11.6 0 0 1 6 0c2.29-1.52 3.3-1.2 3.3-1.2.66 1.63.25 2.83.12 3.13.77.82 1.24 1.87 1.24 3.15 0 4.5-2.81 5.49-5.49 5.78.43.36.81 1.08.81 2.18v3.24c0 .31.21.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5Z" />
    </svg>
  );
}
