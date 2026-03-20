import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alnasri App",
  description: "Patient system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}