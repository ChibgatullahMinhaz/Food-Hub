import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionBoundary } from "@/components/auth/auth-session-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/app/store-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub | A little joy in every bite",
  description:
    "Feel-good food made fresh and delivered with love. Find your next favorite meal at FoodHub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AuthSessionBoundary>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthSessionBoundary>
        </StoreProvider>
      </body>
    </html>
  );
}
