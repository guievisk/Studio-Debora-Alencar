import Link from "next/link";
import styles from "./page.module.css";
import { categories } from "@/data/services";

const PILLARS = [
  {
    title: "Estudo individual",
    text: "Análise minuciosa do formato dos olhos antes de cada procedimento.",
  },
  {
    title: "Técnica precisa",
    text: "Aplicação fio a fio com produtos premium e cuidado milimétrico.",
  },
  {
    title: "Resultado duradouro",
    text: "Acompanhamento pós-procedimento e orientações personalizadas.",
  },
];

const featured = categories.map((cat) => ({
  name: cat.services[0].name,
  category: cat.title,
  image: cat.services[0].image,
  slug: cat.services[0].slug,
}));

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Realce a sua
          <br />
          <em>beleza natural</em>
        </h1>

        <p className={styles.subtitle}>
          Extensão de cílios, design de sobrancelhas e tratamentos labiais
          com técnica e cuidado em Goiânia.
        </p>

        <div className={styles.buttons}>
          <Link href="/contato" className={styles.btnPrimary}>
            Agendar Horário
          </Link>
          <Link href="/servicos" className={styles.btnSecondary}>
            Ver Serviços
          </Link>
        </div>
      </section>

      <div className={styles.divider} />

      {/* DESTAQUES */}
      <section className={styles.featured}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionNumber}>— 01 —</div>
          <span className={styles.sectionLabel}>O que oferecemos</span>
          <h2 className={styles.sectionTitle}>
            Tratamentos <em>exclusivos</em>
          </h2>
        </div>

        <div className={styles.featuredGrid}>
          {featured.map((item) => (
            <Link
              key={item.slug}
              href={`/servicos/${item.slug}`}
              className={styles.featuredCard}
            >
              <div>
                <div className={styles.featuredCategory}>{item.category}</div>
                <h3 className={styles.featuredName}>{item.name}</h3>
              </div>
              <div className={styles.featuredArrow}>→</div>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles.divider} />

      {/* PILARES */}
      <section className={styles.pillars}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionNumber}>— 02 —</div>
          <span className={styles.sectionLabel}>A abordagem</span>
          <h2 className={styles.sectionTitle}>
            Três pilares em cada <em>atendimento</em>
          </h2>
        </div>

        <div className={styles.pillarsGrid}>
          {PILLARS.map((p, i) => (
            <div key={p.title} className={styles.pillarCard}>
              <div className={styles.pillarNumberBig}>0{i + 1}</div>
              <div className={styles.pillarLabel}>Pilar 0{i + 1}</div>
              <h3 className={styles.pillarTitle}>{p.title}</h3>
              <p className={styles.pillarText}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>
            Pronta para um <em>novo olhar</em>?
          </h2>
          <p className={styles.ctaText}>
            Agende sua avaliação e descubra qual técnica é ideal para você.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/contato" className={styles.btnGold}>
              Agendar Horário
            </Link>
            <Link href="/servicos" className={styles.btnGlass}>
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}