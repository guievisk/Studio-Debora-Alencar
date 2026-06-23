"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { getServiceBySlug } from "@/data/services";
import styles from "./page.module.css";

export default function ServicePage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = getServiceBySlug(slug);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!service) {
    notFound();
  }

  async function handlePayment() {
    if (!service?.price) {
      alert("Preço não disponível. Entre em contato pelo WhatsApp.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: service.name,
          price: service.price,
          slug: service.slug,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao gerar pagamento. Tente novamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao gerar pagamento. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <section className={styles.page}>
      <Link href="/servicos" className={styles.back}>
        ← Voltar para serviços
      </Link>

      <div className={styles.grid}>
        <div
          className={styles.imageMain}
          onClick={() => setLightbox(service.image)}
        >
          <Image
            src={service.image}
            alt={service.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.mainImg}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.sectionLabel}>{service.name}</div>
          <h1 className={styles.title}>{service.name}</h1>
          <p className={styles.price}>
            {service.price ? `R$ ${service.price}` : "Sob consulta"}
          </p>
          <p className={styles.description}>
            {service.longDescription || service.description}
          </p>

          <button
            onClick={handlePayment}
            disabled={loading}
            className={styles.cta}
          >
            {loading ? "Processando..." : "Agendar este serviço"}
          </button>
        </div>
      </div>

      {service.gallery && service.gallery.length > 0 && (
        <div className={styles.gallery}>
          <h2 className={styles.galleryTitle}>Resultados</h2>
          <div className={styles.galleryGrid}>
            {service.gallery.map((img, i) => (
              <div
                key={i}
                className={styles.galleryItem}
                onClick={() => setLightbox(img)}
              >
                <Image
                  src={img}
                  alt={`${service.name} ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
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