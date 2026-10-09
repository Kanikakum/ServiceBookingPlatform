import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ServiceBooking — Home & Local Services Platform",
  description:
    "Production-grade on-demand service booking marketplace with real-time availability and concurrency protection.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-white border-t border-[#E5E5E5] py-6 text-center text-xs text-gray-500">
            <p>© 2026 ServiceBooking Platform. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
