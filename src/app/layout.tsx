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

export const metadata: Metadata = {
  title: {
    default: "TransToledo Transportes",
    template: "%s | TransToledo",
  },
  description:
    "Transporte de passageiros para turismo, eventos, excursões, shows, universidades e viagens personalizadas com segurança e conforto.",
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