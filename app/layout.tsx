//app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cimetiere russe",
  description: "localisation d'utilisateur sur le cimetiere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
