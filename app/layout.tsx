import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
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
      <body className="font-sf-pro antialiased">
        <ThemeProvider>
          {children}
          <LiquidGlassNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

