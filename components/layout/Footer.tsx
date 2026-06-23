import Link from "next/link";
import { contactInfo } from "@/data/services";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider} />

      <div className={styles.content}>
        <div className={styles.brandBlock}>
          <span className={styles.brandName}>
            Débora Alencar <em>Beauty</em>
          </span>
          <p className={styles.brandTagline}>
            Especialista em embelezamento do olhar — extensão de cílios,
            sobrancelhas e tratamentos labiais em Goiânia.
          </p>
        </div>

        <div className={styles.column}>
          <h4>Navegação</h4>
          <div className={styles.linkList}>
            <Link href="/">Home</Link>
            <Link href="/sobre">Sobre</Link>
            <Link href="/servicos">Serviços</Link>
            <Link href="/galeria">Galeria</Link>
            <Link href="/contato">Contato</Link>
          </div>
        </div>

        <div className={styles.column}>
          <h4>Contato</h4>
          <div className={styles.linkList}>
            <span>{contactInfo.address}</span>
            <span>{contactInfo.city}</span>
            <a
            >
            
              href={`https://instagram.com/${contactInfo.instagram}`}
              target="_blank"
              rel="noopener noreferrer"

              @{contactInfo.instagram}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Débora Alencar Beauty. Todos os direitos reservados.</span>
        <span>Desenvolvido por Guilherme</span>
      </div>
    </footer>
  );
}