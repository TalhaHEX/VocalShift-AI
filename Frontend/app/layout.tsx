import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "VocalShift Studio | Video Dubbing & Speech Translation",
  description:
    "Production-grade video dubbing, acoustic extraction, and multilingual speech translation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen ambient-canvas text-slate-900 font-sans antialiased flex flex-col selection:bg-indigo-100 selection:text-indigo-900"
      >
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
