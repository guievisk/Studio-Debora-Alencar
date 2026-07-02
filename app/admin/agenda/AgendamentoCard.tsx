"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type Agendamento = {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  service_slug: string;
  service_name: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  duracao_minutos: number;
  status: string;
};

export default function AgendamentoCard({
  ag,
  passado,
}: {
  ag: Agendamento;
  passado?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [novaData, setNovaData] = useState(ag.data);
  const [novaHora, setNovaHora] = useState(ag.hora_inicio.slice(0, 5));
  const [erro, setErro] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const dataObj = new Date(`${ag.data}T12:00:00`);
  const whatsappLimpo = ag.cliente_whatsapp?.replace(/\D/g, "") || "";

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAction(action: string) {
    if (action === "cancelar" && !confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/admin/agendamento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ag.id, action }),
      });

      const result = await res.json();

      if (result.success) {
        mostrarToast(action === "confirmar" ? "Agendamento confirmado!" : "Agendamento cancelado.");
        router.refresh();
      } else {
        setErro(result.error || "Erro ao atualizar");
      }
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditar() {
    setLoading(true);
    setErro(null);

    try {
      const res = await fetch("/api/admin/agendamento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ag.id,
          action: "editar",
          data: novaData,
          hora_inicio: novaHora,
          service_slug: ag.service_slug,
        }),
      });

      const result = await res.json();

      if (result.success) {
        mostrarToast("Agendamento remarcado!");
        setEditando(false);
        router.refresh();
      } else {
        setErro(result.error || "Erro ao remarcar");
      }
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.agendaCard} ${passado ? styles.cardPassado : ""}`}>
      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}

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
          <span>{ag.hora_inicio.slice(0, 5)} — {ag.hora_fim.slice(0, 5)}</span>
          <span>{ag.duracao_minutos} min</span>
        </div>

        <div className={styles.agendaCliente}>
          <span>{ag.cliente_nome}</span>
          <a href={`https://wa.me/${whatsappLimpo}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappLink}>{ag.cliente_whatsapp}</a>
        </div>

        {editando && (
          <div className={styles.editForm}>
            <input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className={styles.editInput} />
            <input type="time" value={novaHora} onChange={(e) => setNovaHora(e.target.value)} className={styles.editInput} />
            <button onClick={handleEditar} disabled={loading} className={styles.btnSalvar}>Salvar</button>
            <button onClick={() => { setEditando(false); setErro(null); }} className={styles.btnCancelarEdit}>Voltar</button>
          </div>
        )}

        {erro && <p className={styles.erroMsg}>{erro}</p>}

        {!passado && ag.status !== "cancelado" && (
          <div className={styles.acoes}>
            {ag.status === "pendente" && (
              <button onClick={() => handleAction("confirmar")} disabled={loading} className={styles.btnConfirmar}>Confirmar</button>
            )}
            <button onClick={() => setEditando(!editando)} disabled={loading} className={styles.btnRemarcar}>Remarcar</button>
            <button onClick={() => handleAction("cancelar")} disabled={loading} className={styles.btnCancelar}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}