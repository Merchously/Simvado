import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simvado — The Flight Simulator for Leadership",
  description:
    "Practice high-stakes decisions in cinematic, AI-powered simulations. The professional training platform for executives, boards, and leaders.",
  openGraph: {
    title: "Simvado — The Flight Simulator for Leadership",
    description:
      "Practice high-stakes decisions in cinematic, AI-powered simulations.",
    url: "https://simvado.com",
    siteName: "Simvado",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = clerkKey && clerkKey.startsWith("pk_");

  const content = (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );

  if (!hasValidClerkKey) {
    return content;
  }

  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      {content}
    </ClerkProvider>
  );
}
