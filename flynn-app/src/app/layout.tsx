import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vector Grid Lab",
  description: "Advanced vector field visualization and animation laboratory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistMono.variable} suppressHydrationWarning>
      <body className="font-mono" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
