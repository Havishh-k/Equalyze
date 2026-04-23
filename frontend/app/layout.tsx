import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "Equalyze — AI Bias Detection & Governance Platform",
  description:
    "Make algorithmic discrimination visible, explainable, and legally actionable. Detect, prove, and fix AI bias before it costs a life or a livelihood.",
  keywords: [
    "AI bias detection",
    "algorithmic fairness",
    "AI governance",
    "counterfactual analysis",
    "responsible AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
