
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";

import { ThemeProvider } from "@/components/providers/ThemeProvider";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

const siteUrl =
  "https://www.transportes-transtoledo.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "TransToledo Transportes",
    template: "%s | TransToledo",
  },

  description:
    "Transporte de passageiros para turismo, eventos, excursões, shows, universidades e viagens personalizadas com segurança e conforto.",

  applicationName: "TransToledo Transportes",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "TransToledo Transportes",
    title: "TransToledo Transportes",
    description:
      "Viaje com segurança e conforto. Solicite seu orçamento para turismo, excursões, eventos e viagens personalizadas.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "TransToledo Transportes - Turismo e viagens",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TransToledo Transportes",
    description:
      "Transporte de passageiros para turismo, excursões, eventos e viagens personalizadas.",
    images: ["/opengraph-image.png"],
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} ${montserrat.variable} min-h-screen antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
