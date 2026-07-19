import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";

import { Providers } from "@/components/layout/providers";
import { APP_NAME } from "@/lib/constants";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Task Manager`,
  description: "A simple but professional Kanban board for organizing your work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lexend.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
