import type { Metadata, Viewport } from "next";
import { Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "Flight Panel · Split-Flap",
  description: "Painel mecânico analógico de partidas e radar aéreo em tempo real",
  manifest: "/manifest.json",
  other: {
    google: "notranslate",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flight Panel",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import AlertaAtualizacao from "@/components/AlertaAtualizacao";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="google" content="notranslate" />
        <meta name="googlebot" content="notranslate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${geistMono.variable} ${vt323.variable} notranslate font-mono antialiased bg-[#050608] text-white overflow-hidden`}>
        {/* Alerta de Atualização Ativo para ecrãs e quiosques permanentemente ligados */}
        <AlertaAtualizacao />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((reg) => {
                    reg.update();
                    // Verificação periódica do Service Worker a cada 5 minutos
                    setInterval(() => {
                      reg.update().catch(() => {});
                    }, 5 * 60 * 1000);
                  }).catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
