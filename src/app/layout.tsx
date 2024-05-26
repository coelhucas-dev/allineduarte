import type { Metadata } from "next";
// import { Lato } from "next/font/google";
// import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

// const lato = Lato({ subsets: ["latin"], weight: "400" });

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
      <body className={cn("min-h-screen bg-background")}>
        {/* <Providers>{children}</Providers> */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
