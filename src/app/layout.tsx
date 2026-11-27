import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeLviv Admin",
  description: "Minimal administration console for LeLviv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-bg text-text">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
