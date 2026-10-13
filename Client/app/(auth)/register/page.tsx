import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create an account | FoodHub",
  description: "Join FoodHub for fresh food and a little joy in every bite.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
