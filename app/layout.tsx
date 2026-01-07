import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simple Notes",
  description: "A simple note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black max-w-2xl mx-auto px-4 py-6`}
      >
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h1 className="text-xl font-bold">Simple Notes</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/notes" className="hover:text-accent transition-colors">노트 목록</a>
            <a href="/notes/new" className="text-accent font-medium hover:underline">새 노트</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
