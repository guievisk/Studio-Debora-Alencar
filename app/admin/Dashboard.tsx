"use client";
import styles from "./dashboard.module.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";


interface Pagamento {
  id: string;
  created_at: string;
  service_name: string | null;
  amount: number | null;
  status: string | null;
}

interface DashboardProps {
  pagamentos: Pagamento[];
}

const COLORS_STATUS: Record<string, string> = {
  approved: "#2d7a2d",
  pending: "#9C7825",
  rejected: "#a83232",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Aprovados",
  pending: "Pendentes",
  rejected: "Recusados",
};

export default function Dashboard({ pagamentos }: DashboardProps) {
  // 1. Faturamento por mês (só aprovados)
  const aprovados = pagamentos.filter((p) => p.status === "approved");

  const faturamentoPorMes: Record<string, number> = {};
  aprovados.forEach((p) => {
    const data = new Date(p.created_at);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    faturamentoPorMes[chave] = (faturamentoPorMes[chave] || 0) + (p.amount || 0);
  });

  const dadosFaturamento = Object.entries(faturamentoPorMes)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mes, valor]) => ({
      mes: mes.split("-").reverse().join("/"),
      valor: Number(valor.toFixed(2)),
    }));

  // 2. Serviços mais vendidos (só aprovados)
  const contagemServicos: Record<string, number> = {};
  aprovados.forEach((p) => {
    const nome = p.service_name || "Desconhecido";
    contagemServicos[nome] = (contagemServicos[nome] || 0) + 1;
  });

  const dadosServicos = Object.entries(contagemServicos)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, quantidade]) => ({ nome, quantidade }));

  // 3. Status dos pagamentos (todos)
  const contagemStatus: Record<string, number> = {};
  pagamentos.forEach((p) => {
    const status = p.status || "unknown";
    contagemStatus[status] = (contagemStatus[status] || 0) + 1;
  });

  const dadosStatus = Object.entries(contagemStatus).map(([status, valor]) => ({
    name: STATUS_LABELS[status] || status,
    value: valor,
    color: COLORS_STATUS[status] || "#999",
  }));

  const semDados = pagamentos.length === 0;

  if (semDados) {
    return (
      <div className={styles.empty}>
        <p>Os gráficos aparecerão quando houver pagamentos registrados.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardGrid}>
      {/* FATURAMENTO POR MÊS */}
      <div className={styles.chartCard}>
        <div className={styles.chartLabel}>Faturamento mensal</div>
        <h3 className={styles.chartTitle}>Evolução da receita</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dadosFaturamento}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A535" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4A535" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,40,23,0.1)" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 12, fill: "#8a7560" }}
                axisLine={{ stroke: "rgba(61,40,23,0.15)" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#8a7560" }}
                axisLine={{ stroke: "rgba(61,40,23,0.15)" }}
                tickFormatter={(v) => `R$${v}`}
              />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Faturamento"]}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(198,165,90,0.3)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#D4A535"
                strokeWidth={2.5}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SERVIÇOS MAIS VENDIDOS */}
      <div className={styles.chartCard}>
        <div className={styles.chartLabel}>Ranking de serviços</div>
        <h3 className={styles.chartTitle}>Mais vendidos</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dadosServicos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,40,23,0.1)" />
              <XAxis
                type="number"
                tick={{ fontSize: 12, fill: "#8a7560" }}
                axisLine={{ stroke: "rgba(61,40,23,0.15)" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="nome"
                width={140}
                tick={{ fontSize: 11, fill: "#8a7560" }}
                axisLine={{ stroke: "rgba(61,40,23,0.15)" }}
              />
              <Tooltip
                formatter={(value: number) => [`${value}x`, "Vendas"]}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(198,165,90,0.3)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Bar dataKey="quantidade" fill="#3D2817" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* STATUS DOS PAGAMENTOS */}
      <div className={styles.chartCard}>
        <div className={styles.chartLabel}>Visão geral</div>
        <h3 className={styles.chartTitle}>Status dos pagamentos</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={dadosStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {dadosStatus.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}`, name]}
                contentStyle={{
                  background: "rgba(255,255,255,0.95)",
                  border: "1px solid rgba(198,165,90,0.3)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legendas}>
            {dadosStatus.map((item) => (
              <div key={item.name} className={styles.legendaItem}>
                <div
                  className={styles.legendaCor}
                  style={{ background: item.color }}
                />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}