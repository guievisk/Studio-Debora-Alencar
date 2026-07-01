import { createSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import LogoutButton from "./LogoutButton";
import styles from "./page.module.css";
import ChatIA from "./ChatIA";
import Dashboard from "./Dashboard";
import AdminNav from "./AdminNav";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pagamentos } = await supabaseAdmin
    .from("pagamentos")
    .select("*")
    .order("created_at", { ascending: false });

  const lista = pagamentos || [];

  const aprovados = lista.filter((p) => p.status === "approved");
  const totalFaturado = aprovados.reduce((soma, p) => soma + (p.amount || 0), 0);
  const totalPagamentos = lista.length;
  const totalAprovados = aprovados.length;

  const metrics = [
    {
      label: "Faturamento total",
      value: `R$ ${totalFaturado.toFixed(2).replace(".", ",")}`,
      sub: "pagamentos aprovados",
    },
    {
      label: "Pagamentos aprovados",
      value: String(totalAprovados),
      sub: "confirmados",
    },
    {
      label: "Total de transações",
      value: String(totalPagamentos),
      sub: "incluindo pendentes",
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.sectionLabel}>Painel Administrativo</div>
          <h1 className={styles.title}>
            Bem-vinda, <em>Débora</em>
          </h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <AdminNav />

      <div className={styles.metricsGrid}>
        {metrics.map((m, i) => (
          <div key={m.label} className={styles.metricCard}>
            <div className={styles.metricNumberBig}>0{i + 1}</div>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={styles.metricValue}>{m.value}</div>
            <div className={styles.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      <Dashboard pagamentos={lista} />

      <div className={styles.tableSection}>
        <div className={styles.tableHead}>
          <h2 className={styles.tableTitle}>Pagamentos recebidos</h2>
          <span className={styles.tableCount}>{lista.length} no total</span>
        </div>

        {lista.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>○</div>
            <p>Nenhum pagamento registrado ainda.</p>
            <span>Os pagamentos aparecerão aqui automaticamente.</span>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Contato</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.nameCell}>{p.customer_name || "—"}</td>
                    <td>{p.service_name || "—"}</td>
                    <td className={styles.valueCell}>
                      {p.amount
                        ? `R$ ${Number(p.amount).toFixed(2).replace(".", ",")}`
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          p.status === "approved"
                            ? styles.badgeApproved
                            : p.status === "pending"
                            ? styles.badgePending
                            : styles.badgeRejected
                        }`}
                      >
                        {p.status === "approved"
                          ? "Aprovado"
                          : p.status === "pending"
                          ? "Pendente"
                          : "Recusado"}
                      </span>
                    </td>
                    <td className={styles.contactCell}>
                      {p.customer_email || "—"}
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: "56px" }}>
        <h2 className={styles.tableTitle}>Assistente Luna IA</h2>
        <div style={{ marginTop: "24px" }}>
          <ChatIA />
        </div>
      </div>
    </main>
  );
}