"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

const TOTAL_FOTOS = 73;

export default function Galeria() {
  const [fotoAberta, setFotoAberta] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (fotoAberta !== null) {
      dialog?.showModal(); // Força o elemento acima de toda a página
      document.body.style.overflow = "hidden";
    } else {
      dialog?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fotoAberta]);

  const fotos = Array.from({ length: TOTAL_FOTOS }, (_, i) => i + 1);

  return (
    <section className={styles.gallery}>
      <div className={styles.header}>
        <h2 className={styles.title}>Nossa <em>galeria</em></h2>
        <p className={styles.subtitle}>
          Resultados reais de clientes que confiaram no nosso trabalho.
        </p>
      </div>

      <div className={styles.grid}>
        {fotos.map((num) => (
          <div className={styles.item} key={num}>
            <a
              href={`#image${num}`}
              onClick={(e) => {
                e.preventDefault(); 
                setFotoAberta(num);
              }}
            >
              <img
                src={`/galeria/${num}.jpeg`}
                alt={`Foto ${num}`}
                loading="lazy"
              />
            </a>
          </div>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        onClose={() => setFotoAberta(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setFotoAberta(null);
          }
        }}
      >
        <button className={styles.fechar} onClick={() => setFotoAberta(null)}>
          ×
        </button>
        {fotoAberta !== null && (
          <img
            src={`/galeria/${fotoAberta}.jpeg`}
            alt={`Foto ampliada ${fotoAberta}`}
            className={styles.fotoGrande}
          />
        )}
      </dialog>
    </section>
  );
}