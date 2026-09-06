import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Valadares Airspace Panel",
  description: "Monitorização de voos e meteorologia sobre Valadares",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className={`${geistMono.variable} font-mono antialiased bg-black`}>
        {children}
      </body>
    </html>
  );
}
