import Link from "next/link";
import styles from "./page.module.css";

export default function Sucesso() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>✓</div>
        </div>

        <div className={styles.sectionLabel}>Pagamento confirmado</div>

        <h1 className={styles.title}>
          Obrigada pela <em>confiança</em>!
        </h1>

        <p className={styles.description}>
          Recebi seu pagamento e em breve entrarei em contato pelo WhatsApp
          para combinarmos o melhor horário para o seu atendimento.
        </p>

        <div className={styles.info}>
          <p className={styles.infoTitle}>Próximos passos</p>
          <ul className={styles.steps}>
            <li>Você receberá uma mensagem no WhatsApp em até 24 horas</li>
            <li>Vamos combinar a data e o horário que funciona pra você</li>
            <li>No dia, é só comparecer ao estúdio</li>
          </ul>
        </div>

        <div className={styles.buttons}>
          <Link href="/" className={styles.btnPrimary}>
            Voltar ao início
          </Link>
          <Link href="/servicos" className={styles.btnSecondary}>
            Ver outros serviços
          </Link>
        </div>
      </div>
    </section>
  );
}