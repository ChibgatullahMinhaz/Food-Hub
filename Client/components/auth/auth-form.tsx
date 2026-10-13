"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "login" | "register";
};

function getAuthCallbackURL() {
  const nextPath = new URLSearchParams(window.location.search).get("next");
  const safeNextPath =
    nextPath?.startsWith("/") &&
    !nextPath.startsWith("//") &&
    !nextPath.startsWith("/login") &&
    !nextPath.startsWith("/register")
      ? nextPath
      : "/dashboard";

  return `${window.location.origin}${safeNextPath}`;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const session = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<
    "email" | "google" | null
  >(null);

  useEffect(() => {
    if (!session.isPending && session.data) {
      router.replace("/dashboard");
    }
  }, [router, session.data, session.isPending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (isRegister && password !== formData.get("confirmPassword")) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setPendingAction("email");

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: getAuthCallbackURL(),
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: getAuthCallbackURL(),
            rememberMe: formData.get("remember") === "on",
          });

      if (result.error) {
        setErrorMessage(result.error.message || "Authentication failed.");
        return;
      }

      router.replace(getAuthCallbackURL().replace(window.location.origin, ""));
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the authentication service."
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");
    setPendingAction("google");

    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: getAuthCallbackURL(),
        errorCallbackURL: `${window.location.origin}/login`,
      });

      if (result.error) {
        setErrorMessage(result.error.message || "Google sign-in failed.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the authentication service."
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <header className="auth-header">
          <Link className="brand" href="/" aria-label="FoodHub home">
            <span className="brand__mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none">
                <path
                  d="M5 17h22l-2.3 8.1a3 3 0 0 1-2.9 2.2H10.2a3 3 0 0 1-2.9-2.2L5 17Z"
                  fill="currentColor"
                />
                <path
                  d="M3.5 16.5h25M10 12c0-1.5 1-2.2 1-3.7M16 12c0-1.5 1-2.2 1-3.7M22 12c0-1.5 1-2.2 1-3.7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.2"
                />
              </svg>
            </span>
            <span className="brand__name">
              food<span>hub</span>
            </span>
          </Link>
          <Link className="auth-home-link" href="/">
            Back to home <ArrowRight aria-hidden="true" />
          </Link>
        </header>

        <div className="auth-content">
          <div className="auth-eyebrow">
            <span className="eyebrow__dot" />
            {isRegister ? "A SEAT AT OUR TABLE" : "WELCOME BACK"}
          </div>
          <h1 id="auth-title">
            {isRegister ? (
              <>
                Good food starts
                <br />
                with <span>good company.</span>
              </>
            ) : (
              <>
                Your next bite
                <br />
                is <span>waiting.</span>
              </>
            )}
          </h1>
          <p className="auth-description">
            {isRegister
              ? "Create an account and make every meal a little more joyful."
              : "Sign in for your feel-good favorites, made fresh just for you."}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  autoComplete="name"
                  id="auth-name"
                  name="name"
                  placeholder="Jamie Taylor"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                autoComplete="email"
                id="auth-email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-field__label-row">
                <label htmlFor="auth-password">Password</label>
                {!isRegister && <span>At least 8 characters</span>}
              </div>
              <div className="auth-password">
                <input
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  id="auth-password"
                  minLength={8}
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="auth-password__toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="auth-field">
                <label htmlFor="auth-confirm-password">Confirm password</label>
                <input
                  autoComplete="new-password"
                  id="auth-confirm-password"
                  minLength={8}
                  name="confirmPassword"
                  placeholder="Enter your password again"
                  required
                  type={showPassword ? "text" : "password"}
                />
              </div>
            )}

            {isRegister ? (
              <label className="auth-check">
                <input name="terms" required type="checkbox" />
                <span>I agree to FoodHub&apos;s terms and privacy policy.</span>
              </label>
            ) : (
              <label className="auth-check">
                <input name="remember" type="checkbox" />
                <span>Keep me signed in</span>
              </label>
            )}

            <button
              className="auth-submit"
              disabled={pendingAction !== null}
              type="submit"
            >
              {pendingAction === "email" ? (
                <LoaderCircle aria-hidden="true" className="auth-spinner" />
              ) : (
                <>
                  {isRegister ? "Create my account" : "Sign in"}
                  <ArrowRight aria-hidden="true" />
                </>
              )}
            </button>

            {errorMessage && (
              <p className="auth-notice" role="alert">
                {errorMessage}
              </p>
            )}
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span>OR CONTINUE WITH</span>
          </div>
          <button
            className="auth-google"
            disabled={pendingAction !== null}
            onClick={handleGoogleSignIn}
            type="button"
          >
            {pendingAction === "google" ? (
              <LoaderCircle aria-hidden="true" className="auth-spinner" />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 48 48">
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <p className="auth-switch">
            {isRegister ? "Already part of the table?" : "New to FoodHub?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="auth-legal">Made with love. Served with a smile.</p>
        </div>
      </section>

      <aside className="auth-visual" aria-label="Freshly prepared pizza">
        <div className="auth-visual__photo" />
        <div className="auth-visual__overlay" />
        <div className="auth-visual__top">
          <span className="auth-visual__sparkle" aria-hidden="true">✳</span>
          FRESH FROM OUR KITCHEN
        </div>
        <div className="auth-visual__quote">
          <span className="auth-visual__quote-mark" aria-hidden="true">“</span>
          <p>A little joy in every bite.</p>
          <span>Made fresh. Shared with love.</span>
        </div>
        <div className="auth-visual__badge">
          <span>✳</span>
          <strong>MADE<br />FRESH<br />DAILY</strong>
        </div>
      </aside>
    </main>
  );
}
