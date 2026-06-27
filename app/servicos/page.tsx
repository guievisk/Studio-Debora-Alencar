"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/services";
import styles from "./page.module.css";

export default function Servicos() {
  const [activeCategory, setActiveCategory] = useState(0);
  const active = categories[activeCategory];
//aura
  return (
    <section className={styles.servicos}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.sectionNumber}>— 03 —</div>
        <span className={styles.sectionLabel}>Nossos Serviços</span>
        <h1 className={styles.title}>
          Tratamentos <em>exclusivos</em>
        </h1>
      </div>

      {/* TABS */}
      <div className={styles.tabs}>
        {categories.map((cat, i) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(i)}
            className={activeCategory === i ? styles.tabActive : styles.tab}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {active.services.map((service) => (
          <Link
            key={service.slug}
            href={`/servicos/${service.slug}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={service.image}
                alt={service.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={styles.image}
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardName}>{service.name}</h3>
              <p className={styles.cardDescription}>{service.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardPrice}>
                  {service.price ? `R$ ${service.price}` : "Consultar"}
                </span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}