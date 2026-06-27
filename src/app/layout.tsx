import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/fraunces/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";
import { AuthBridge } from "@/app/auth-bridge";

export const metadata: Metadata = {
  title: "FreshMind",
  description: "FreshMind product mockups built in Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthBridge />
        {children}
      </body>
    </html>
  );
}
