import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Débora Alencar Beauty | Extensão de Cílios em Goiânia",
    template: "%s | Débora Alencar Beauty",
  },
  description:
    "Especialista em extensão de cílios, design de sobrancelhas e tratamentos estéticos em Goiânia-GO. Agende seu horário.",
  keywords: [
    "extensão de cílios Goiânia",
    "design de sobrancelhas Goiânia",
    "lash lifting Goiânia",
    "estética Goiânia",
    "Débora Alencar Beauty",
    "cílios fio a fio Goiânia",
    "volume russo Goiânia",
  ],
  authors: [{ name: "Débora Alencar Beauty" }],
  openGraph: {
    title: "Débora Alencar Beauty | Extensão de Cílios em Goiânia",
    description:
      "Especialista em extensão de cílios, design de sobrancelhas e tratamentos estéticos em Goiânia-GO.",
    url: "https://studio-debora-alencar.vercel.app",
    siteName: "Débora Alencar Beauty",
    locale: "pt_BR",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>
        <AnimatedBackground />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}