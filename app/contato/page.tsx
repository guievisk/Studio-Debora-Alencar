import Link from "next/link";
import styles from "./page.module.css";

const WHATSAPP_NUMBER = "5562981417345";
const PHONE_DISPLAY = "+55 (62) 98141-7345";
const EMAIL = "debora.alemedeiros@gmail.com";
const INSTAGRAM = "deboraalencarbeauty";
const ADDRESS = "Rua João Pessoa, Quadra 51A Lote 13";
const CITY = "Goiânia — GO";
const MAPS_URL = "https://www.google.com/maps/search/D%C3%A9bora%20Alencar%20Beauty/@-16.6147,-49.245,17z?hl=en";

const WHATSAPP_MSG = "Olá Débora, vim pelo site e gostaria de agendar um horário.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

export default function Contato() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.sectionNumber}>— 04 —</div>
        <span className={styles.sectionLabel}>Fale comigo</span>
        <h1 className={styles.title}>
          Vamos <em>conversar</em>?
        </h1>
        <p className={styles.subtitle}>
          Estou aqui para tirar suas dúvidas, agendar seu horário e ajudar você a encontrar o tratamento ideal.
        </p>
      </section>

      <section className={styles.contactGrid}>
        <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={styles.card}>
          <div className={styles.cardLabel}>WhatsApp</div>
          <div className={styles.cardValue}>{PHONE_DISPLAY}</div>
          <div className={styles.cardAction}>
            Conversar agora <span>→</span>
          </div>
        </a>

        <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noopener noreferrer" className={styles.card}>
          <div className={styles.cardLabel}>Instagram</div>
          <div className={styles.cardValue}>@{INSTAGRAM}</div>
          <div className={styles.cardAction}>
            Ver portfólio <span>→</span>
          </div>
        </a>

        <a href={`mailto:${EMAIL}`} className={styles.card}>
          <div className={styles.cardLabel}>E-mail</div>
          <div className={styles.cardValueSmall}>{EMAIL}</div>
          <div className={styles.cardAction}>
            Enviar mensagem <span>→</span>
          </div>
        </a>
      </section>

      <section className={styles.location}>
        <div className={styles.locationContent}>
          <div className={styles.locationText}>
            <div className={styles.smallLabel}>
              <div className={styles.smallLine} />
              <span>Onde nos encontrar</span>
            </div>
            <h2 className={styles.locationTitle}>
              No coração de <em>Goiânia</em>
            </h2>
            <p className={styles.locationAddress}>{ADDRESS}</p>
            <p className={styles.locationCity}>{CITY}</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className={styles.mapsButton}>
              Abrir no Google Maps <span>→</span>
            </a>
          </div>

          <div className={styles.mapWrapper}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.234!2d-49.245!3d-16.6147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDM2JzUyLjkiUyA0OcKwMTQnNDIuMCJX!5e0!3m2!1spt-BR!2sbr!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>
            Pronta para <em>começar</em>?
          </h2>
          <p className={styles.ctaText}>
            Me chame no WhatsApp e vamos combinar seu horário.
          </p>
          <div className={styles.ctaButtons}>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className={styles.btnGold}>
              Chamar no WhatsApp
            </a>
            <Link href="/servicos" className={styles.btnGlass}>
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}