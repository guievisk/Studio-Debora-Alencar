import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Sobre() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.title}>
          Oito anos
          <br />
          <em>refinando</em> o olhar.
        </h1>

        <p className={styles.subtitle}>
          Cada cliente é uma história, cada olhar é único. Há quase uma década
          dedico minha técnica e meu tempo a um único propósito: realçar a
          beleza natural de quem confia no meu trabalho.
        </p>
      </section>

      {/* STORY */}
      <section className={styles.story}>
        <div className={styles.storyGrid}>
          {/* Foto */}
          <div className={styles.photoWrapper}>
            <div className={styles.photo}>
              <Image
                src="/sobre/1.jpeg"
                alt="Débora Alencar"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.photoImg}
              />

              <div className={styles.photoBadge}>
                <div>
                  <div className={styles.badgeLabel}>Especialista</div>
                  <div className={styles.badgeName}>Cílios & Sobrancelhas</div>
                </div>
                <div className={styles.badgeIcon}>
                <Image src="/llogo.png" alt="" width={40} height={40} />
              </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className={styles.storyText}>
            <div className={styles.smallLabel}>
              <div className={styles.smallLine} />
              <span>A história</span>
            </div>

            <h2 className={styles.storyTitle}>
              De muitas técnicas, uma <em>paixão</em>.
            </h2>

            <div className={styles.paragraphs}>
              <p>
                Comecei minha jornada na beleza com maquiagem, extensão de cílios
                e limpeza de pele. Cada técnica trazia uma lição, cada cliente
                uma história única.
              </p>
              <p>
                Com o tempo agreguei o design de sobrancelhas — e foi nesse
                momento que descobri onde minha paixão verdadeira morava.
              </p>

              <div className={styles.quote}>
                "Decidi me dedicar exclusivamente ao embelezamento do olhar —
                onde técnica encontra a alma de cada cliente."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsWrapper}>
        <div className={styles.stats}>
          <div className={styles.statsLabel}>
            <span>Em números</span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>08</div>
              <div className={styles.statLabel}>Anos dedicados</div>
              <div className={styles.statSub}>ao ofício</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statNumber}>5000</div>
              <div className={styles.statLabel}>Clientes atendidas</div>
              <div className={styles.statSub}>em Goiânia</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statNumber}>
                100<span className={styles.statPercent}>%</span>
              </div>
              <div className={styles.statLabel}>Cuidado</div>
              <div className={styles.statSub}>personalizado</div>
            </div>
          </div>
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