import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Extensão de cílios, design de sobrancelhas, lash lifting e tratamentos estéticos. Veja nossos serviços e preços.",
};

export default function ServicosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}