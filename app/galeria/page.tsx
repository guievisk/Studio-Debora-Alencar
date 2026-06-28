"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história da Débora Alencar, especialista em extensão de cílios com mais de 8 anos de experiência em Goiânia.",
};

// CONFIGURE AQUI: define o range de fotos de cada categoria
const PHOTO_RANGES = {
  cilios: { start: 1, end: 40 },
  sobrancelhas: { start: 41, end: 55 },
  labios: { start: 56, end: 73 },
};

const CATEGORIES = [
  { id: "todas", label: "Todas" },
  { id: "cilios", label: "Cílios" },
  { id: "sobrancelhas", label: "Sobrancelhas" },
  { id: "labios", label: "Lábios" },
];

// Gera as fotos a partir dos ranges
function getPhotos(category: string) {
  if (category === "todas") {
    return Array.from({ length: 73 }, (_, i) => ({
      src: `/galeria/${i + 1}.jpeg`,
      id: i + 1,
    }));
  }

  const range = PHOTO_RANGES[category as keyof typeof PHOTO_RANGES];
  if (!range) return [];

  const photos = [];
  for (let i = range.start; i <= range.end; i++) {
    photos.push({ src: `/galeria/${i}.jpeg`, id: i });
  }
  return photos;
}

export default function Galeria() {
  const [activeCategory, setActiveCategory] = useState("todas");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const photos = getPhotos(activeCategory);

  return (
    <section className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.sectionNumber}>— 05 —</div>
        <span className={styles.sectionLabel}>Portfólio</span>
        <h1 className={styles.title}>
          Resultados <em>reais</em>
        </h1>
        <p className={styles.subtitle}>
          Cada trabalho é único, pensado para realçar a beleza natural de quem
          confia em mim. Veja o que já criei.
        </p>
      </div>

      {/* FILTROS */}
      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={activeCategory === cat.id ? styles.tabActive : styles.tab}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={styles.photoItem}
            onClick={() => setLightbox(photo.src)}
          >
            <Image
              src={photo.src}
              alt={`Trabalho ${photo.id}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.photoImg}
            />
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <div className={styles.lightboxImage}>
            <Image
              src={lightbox}
              alt="Foto ampliada"
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </section>
  );
}