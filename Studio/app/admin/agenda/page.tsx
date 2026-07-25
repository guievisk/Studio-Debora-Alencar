import { supabaseAdmin } from "@/lib/supabase";
import AdminNav from "../AdminNav";
import styles from "./page.module.css";
import AgendamentoCard from "./AgendamentoCard";

export default async function AgendaPage() {
  const hoje = new Date().toISOString().split("T")[0];

  const { data: agendamentos } = await supabaseAdmin
    .from("agendamentos")
    .select("*")
    .gte("data", hoje)
    .order("data", { ascending: true })
    .order("hora_inicio", { ascending: true });

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const { data: passados } = await supabaseAdmin
    .from("agendamentos")
    .select("*")
    .lt("data", hoje)
    .gte("data", trintaDiasAtras.toISOString().split("T")[0])
    .order("data", { ascending: false })
    .order("hora_inicio", { ascending: false });

  const proximos = agendamentos || [];
  const anteriores = passados || [];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionLabel}>Painel Administrativo</div>
          <h1 className={styles.title}>
            Sua <em>agenda</em>
          </h1>
        </div>
      </div>

      <AdminNav />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Próximos agendamentos</h2>
          <span className={styles.count}>
            {proximos.length} agendado{proximos.length !== 1 ? "s" : ""}
          </span>
        </div>

        {proximos.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum agendamento próximo.</p>
            <span>Os agendamentos feitos pela Luna aparecerão aqui.</span>
          </div>
        ) : (
          <div className={styles.cardsList}>
            {proximos.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} />
            ))}
          </div>
        )}
      </section>

      {anteriores.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Últimos 30 dias</h2>
            <span className={styles.count}>
              {anteriores.length} registro{anteriores.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className={styles.cardsList}>
            {anteriores.map((ag) => (
              <AgendamentoCard key={ag.id} ag={ag} passado />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}