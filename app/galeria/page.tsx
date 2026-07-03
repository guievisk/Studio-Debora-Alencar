"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";

type Categoria = "todas" | "cilios" | "sobrancelhas" | "labios";

const FOTOS_POR_CATEGORIA: Record<Exclude<Categoria, "todas">, number[]> = {
  cilios: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
  sobrancelhas: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
  labios: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73],
};

const TODAS_FOTOS = [
  ...FOTOS_POR_CATEGORIA.cilios,
  ...FOTOS_POR_CATEGORIA.sobrancelhas,
  ...FOTOS_POR_CATEGORIA.labios,
];

const CATEGORIAS: { id: Categoria; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "cilios", label: "Cílios" },
  { id: "sobrancelhas", label: "Sobrancelhas" },
  { id: "labios", label: "Lábios" },
];

export default function GaleriaPage() {
  const [categoria, setCategoria] = useState<Categoria>("todas");
  const [fotoAberta, setFotoAberta] = useState<number | null>(null);

  const fotosExibidas =
    categoria === "todas" ? TODAS_FOTOS : FOTOS_POR_CATEGORIA[categoria];

  useEffect(() => {
    if (fotoAberta !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fotoAberta]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFotoAberta(null);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  function proximaFoto() {
    if (fotoAberta === null) return;
    const idx = fotosExibidas.indexOf(fotoAberta);
    const proxima = fotosExibidas[(idx + 1) % fotosExibidas.length];
    setFotoAberta(proxima);
  }

  function fotoAnterior() {
    if (fotoAberta === null) return;
    const idx = fotosExibidas.indexOf(fotoAberta);
    const anterior = fotosExibidas[(idx - 1 + fotosExibidas.length) % fotosExibidas.length];
    setFotoAberta(anterior);
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.sectionNumber}>— 03 —</div>
        <span className={styles.sectionLabel}>Nossos trabalhos</span>
        <h1 className={styles.title}>
          Nossa <em>galeria</em>
        </h1>
        <p className={styles.subtitle}>
          Resultados reais de clientes que confiaram no nosso trabalho.
        </p>
      </div>

      <div className={styles.filtros}>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoria(cat.id)}
            className={
              categoria === cat.id ? styles.filtroAtivo : styles.filtro
            }
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {fotosExibidas.map((num) => (
          <div
            key={num}
            className={styles.item}
            onClick={() => setFotoAberta(num)}
          >
            <Image
              src={`/galeria/${num}.jpeg`}
              alt={`Trabalho ${num}`}
              width={400}
              height={500}
              className={styles.foto}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {fotoAberta !== null && (
        <div className={styles.lightbox} onClick={() => setFotoAberta(null)}>
          <button
            className={styles.fecharBtn}
            onClick={(e) => {
              e.stopPropagation();
              setFotoAberta(null);
            }}
            aria-label="Fechar"
          >
            ×
          </button>

          <button
            className={`${styles.navBtn} ${styles.navBtnLeft}`}
            onClick={(e) => {
              e.stopPropagation();
              fotoAnterior();
            }}
            aria-label="Foto anterior"
          >
            ‹
          </button>

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/galeria/${fotoAberta}.jpeg`}
              alt={`Trabalho ${fotoAberta}`}
              width={1400}
              height={1400}
              className={styles.fotoLightbox}
              quality={95}
              priority
            />
          </div>

          <button
            className={`${styles.navBtn} ${styles.navBtnRight}`}
            onClick={(e) => {
              e.stopPropagation();
              proximaFoto();
            }}
            aria-label="Próxima foto"
          >
            ›
          </button>

          <div className={styles.contador}>
            {fotosExibidas.indexOf(fotoAberta) + 1} / {fotosExibidas.length}
          </div>
        </div>
      )}
    </section>
  );
}