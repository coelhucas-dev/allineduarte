import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const lato = Lato({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Alline Duarte",
  description: "Nutri Alline Duarte",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
