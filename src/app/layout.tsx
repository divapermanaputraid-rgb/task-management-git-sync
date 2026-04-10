import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internal Task Management",
  description: "Sistem manajemen tugas internal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
