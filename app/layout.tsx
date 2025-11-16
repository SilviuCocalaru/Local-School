import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/lib/i18n/i18nProvider";
import LiquidGlassNav from "@/components/layout/LiquidGlassNav";

export const metadata: Metadata = {
  title: "Local School Social",
  description: "Social media for local schools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sf-pro antialiased pb-safe bg-white dark:bg-slate-950">
        <ThemeProvider>
          <I18nProvider>
            <main>{children}</main>
            <LiquidGlassNav />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

