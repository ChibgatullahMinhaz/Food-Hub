import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in | FoodHub",
  description: "Sign in to your FoodHub account and find your feel-good favorites.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
