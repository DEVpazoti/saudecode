import type { Metadata, Viewport } from "next";
import { Zilla_Slab, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Zilla_Slab({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--fonte-display",
  display: "swap",
});

const corpo = Public_Sans({
  subsets: ["latin"],
  variable: "--fonte-corpo",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SaudeCode — identificação e histórico de saúde na rua",
    template: "%s · SaudeCode",
  },
  description:
    "Pulseira com QR Code que liga uma pessoa em situação de rua ao seu histórico de saúde. Em segundos a equipe sabe quem está atendendo, do que ela é alérgica e o que já aconteceu antes.",
};

export const viewport: Viewport = {
  themeColor: "#edebe4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${display.variable} ${corpo.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
