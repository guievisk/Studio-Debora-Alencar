import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Veja resultados reais de extensão de cílios, design de sobrancelhas e tratamentos estéticos realizados por Débora Alencar.",
};

export default function GaleriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}