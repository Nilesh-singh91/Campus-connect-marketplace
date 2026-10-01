import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "CampusConnect Marketplace | College-Only Student Marketplace",
  description:
    "A secure, verified campus marketplace for college students to buy, sell, and exchange textbooks, electronics, notes, and hostel equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<div className="h-16 w-full bg-white border-b border-zinc-200" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
