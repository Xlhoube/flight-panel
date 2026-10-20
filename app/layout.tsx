import type { Metadata, Viewport } from "next";
import { Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import AlertaAtualizacao from "@/components/AlertaAtualizacao";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://flight-panel.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Flight Panel — Radar ADS-B & Painel Split-Flap em Tempo Real",
    template: "%s | Flight Panel",
  },
  description:
    "Painel mecânico analógico de partidas e radar aéreo ADS-B em tempo real. Rastreio de voos, telemetria aeronáutica de alta precisão e estação meteorológica dedicada num raio de 20 km.",
  keywords: [
    "Flight Panel",
    "Radar ADS-B",
    "Split Flap",
    "Solari board",
    "Flight Tracker",
    "Rastreio de voos em tempo real",
    "Aviação",
    "OpenSky Network",
    "Telemetria aeronáutica",
    "The Flight Wall",
    "PWA Aviação",
  ],
  authors: [{ name: "Flight Panel" }],
  creator: "Flight Panel",
  publisher: "Flight Panel",
  applicationName: "Flight Panel",
  category: "Aviation & Weather",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["en_US", "fr_FR", "es_ES"],
    url: siteUrl,
    siteName: "Flight Panel",
    title: "Flight Panel — Radar ADS-B & Painel Split-Flap em Tempo Real",
    description:
      "Monitorização de tráfego aéreo ao vivo com radar ADS-B, réplica analógica Solari split-flap de partidas, telemetria de voo e meteorologia num raio de 20 km.",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 675,
        alt: "Flight Panel — Radar ADS-B e Painel Mecânico Split-Flap de Voos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flight Panel — Radar ADS-B & Painel Split-Flap em Tempo Real",
    description:
      "Monitorização de tráfego aéreo ao vivo com radar ADS-B, réplica analógica Solari split-flap e telemetria aeronáutica.",
    images: ["/og-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    google: "notranslate",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flight Panel",
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

// Dados estruturados Schema.org para motores de pesquisa (Google Rich Snippets)
const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Flight Panel",
  alternateName: "The Flight Wall Replica",
  url: siteUrl,
  description:
    "Painel analógico mecânico de partidas de voos e radar aéreo ADS-B em tempo real num raio geodésico de 20 km.",
  applicationCategory: "TravelApplication",
  operatingSystem: "Web, iOS, Android, Windows, macOS",
  image: `${siteUrl}/og-preview.png`,
  screenshot: `${siteUrl}/og-preview.png`,
  inLanguage: ["pt", "en", "fr", "es"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  featureList: [
    "Radar ADS-B e ecrã CRT de tráfego aéreo ao vivo",
    "Painel mecânico Split-Flap Solari de partidas e chegadas",
    "Telemetria detalhada de altitude, velocidade, rumo e distância",
    "Estação meteorológica e radar de proximidade de 20 km",
    "Modo Noturno / Sono com silenciamento total e ecrã ultra-escuro",
    "Internacionalização completa em 4 idiomas (PT, EN, FR, ES)",
  ],
};

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
        {/* Schema.org Dados Estruturados para Pesquisa Web */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />
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
