import type { Metadata } from "next";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internal SEO Operations Platform",
  description: "Enterprise Role-Based SEO Operations Control Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
