import { supabaseAdmin } from "@/lib/supabase";
import AdminNav from "../AdminNav";
import styles from "./page.module.css";

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
            {proximos.map((ag) => {
              const dataObj = new Date(`${ag.data}T12:00:00`);
              const whatsappLimpo = ag.cliente_whatsapp?.replace(/\D/g, "") || "";

              return (
                <div key={ag.id} className={styles.agendaCard}>
                  <div className={styles.agendaDate}>
                    <div className={styles.agendaDia}>{dataObj.getDate()}</div>
                    <div className={styles.agendaMes}>
                      {dataObj.toLocaleDateString("pt-BR", { month: "short" })}
                    </div>
                  </div>

                  <div className={styles.agendaInfo}>
                    <div className={styles.agendaTop}>
                      <h3 className={styles.agendaServico}>{ag.service_name}</h3>
                      <span
                        className={`${styles.badge} ${
                          ag.status === "confirmado"
                            ? styles.badgeConfirmado
                            : ag.status === "cancelado"
                            ? styles.badgeCancelado
                            : styles.badgePendente
                        }`}
                      >
                        {ag.status === "confirmado"
                          ? "Confirmado"
                          : ag.status === "cancelado"
                          ? "Cancelado"
                          : "Pendente"}
                      </span>
                    </div>

                    <div className={styles.agendaDetalhes}>
                      <span>{ag.hora_inicio} — {ag.hora_fim}</span>
                      <span>{ag.duracao_minutos} min</span>
                    </div>

                    <div className={styles.agendaCliente}>
                      <span>{ag.cliente_nome}</span>
                      
                    <div className={styles.agendaCliente}>
                      <a href={`https://wa.me/${whatsappLimpo}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>{ag.cliente_whatsapp}</a>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
            {anteriores.map((ag) => {
              const dataObj = new Date(`${ag.data}T12:00:00`);

              return (
                <div key={ag.id} className={`${styles.agendaCard} ${styles.cardPassado}`}>
                  <div className={styles.agendaDate}>
                    <div className={styles.agendaDia}>{dataObj.getDate()}</div>
                    <div className={styles.agendaMes}>
                      {dataObj.toLocaleDateString("pt-BR", { month: "short" })}
                    </div>
                  </div>

                  <div className={styles.agendaInfo}>
                    <div className={styles.agendaTop}>
                      <h3 className={styles.agendaServico}>{ag.service_name}</h3>
                      <span
                        className={`${styles.badge} ${
                          ag.status === "confirmado"
                            ? styles.badgeConfirmado
                            : ag.status === "cancelado"
                            ? styles.badgeCancelado
                            : styles.badgePendente
                        }`}
                      >
                        {ag.status === "confirmado"
                          ? "Confirmado"
                          : ag.status === "cancelado"
                          ? "Cancelado"
                          : "Pendente"}
                      </span>
                    </div>

                    <div className={styles.agendaDetalhes}>
                      <span>
                        {dataObj.toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>{ag.hora_inicio} — {ag.hora_fim}</span>
                    </div>

                    <div className={styles.agendaCliente}>
                      <span>{ag.cliente_nome}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}