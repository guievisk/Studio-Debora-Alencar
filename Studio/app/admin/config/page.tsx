"use client";

import { useState, useEffect } from "react";
import AdminNav from "../AdminNav";
import styles from "./page.module.css";

const DIAS_NOMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface Bloco {
  id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
}

interface Bloqueio {
  id: number;
  data: string;
  motivo: string | null;
}

interface Servico {
  id: number;
  service_slug: string;
  duracao_minutos: number;
}

export default function ConfigPage() {
  const [disponibilidade, setDisponibilidade] = useState<Bloco[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [novaData, setNovaData] = useState("");
  const [novoMotivo, setNovoMotivo] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingWhat, setSavingWhat] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      setDisponibilidade(data.disponibilidade);
      setBloqueios(data.bloqueios);
      setServicos(data.servicos);
    } catch {
      mostrarMensagem("erro", "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }

  function mostrarMensagem(tipo: "sucesso" | "erro", texto: string) {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 3000);
  }

  function atualizarBloco(id: number, campo: keyof Bloco, valor: string | boolean) {
    setDisponibilidade((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [campo]: valor } : b))
    );
  }

  async function salvarHorarios() {
    setSavingWhat("horarios");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "disponibilidade", dados: disponibilidade }),
      });
      if (res.ok) mostrarMensagem("sucesso", "Horários salvos!");
      else mostrarMensagem("erro", "Erro ao salvar horários");
    } catch {
      mostrarMensagem("erro", "Erro de conexão");
    } finally {
      setSavingWhat(null);
    }
  }

  async function adicionarBloqueio() {
    if (!novaData) return;
    setSavingWhat("bloqueio");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "bloqueio_add",
          dados: { data: novaData, motivo: novoMotivo },
        }),
      });
      if (res.ok) {
        mostrarMensagem("sucesso", "Data bloqueada!");
        setNovaData("");
        setNovoMotivo("");
        carregar();
      } else {
        mostrarMensagem("erro", "Erro ao bloquear");
      }
    } catch {
      mostrarMensagem("erro", "Erro de conexão");
    } finally {
      setSavingWhat(null);
    }
  }

  async function removerBloqueio(id: number) {
    setSavingWhat(`bloqueio_${id}`);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "bloqueio_remove", dados: { id } }),
      });
      if (res.ok) {
        mostrarMensagem("sucesso", "Bloqueio removido!");
        carregar();
      }
    } catch {
      mostrarMensagem("erro", "Erro ao remover");
    } finally {
      setSavingWhat(null);
    }
  }

  function atualizarServico(id: number, duracao: number) {
    setServicos((prev) =>
      prev.map((s) => (s.id === id ? { ...s, duracao_minutos: duracao } : s))
    );
  }

  async function salvarServicos() {
    setSavingWhat("servicos");
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "servicos", dados: servicos }),
      });
      if (res.ok) mostrarMensagem("sucesso", "Durações salvas!");
      else mostrarMensagem("erro", "Erro ao salvar");
    } catch {
      mostrarMensagem("erro", "Erro de conexão");
    } finally {
      setSavingWhat(null);
    }
  }

  // Agrupa blocos por dia da semana
  const blocosPorDia: Record<number, Bloco[]> = {};
  disponibilidade.forEach((b) => {
    if (!blocosPorDia[b.dia_semana]) blocosPorDia[b.dia_semana] = [];
    blocosPorDia[b.dia_semana].push(b);
  });

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Carregando <em>configurações</em>...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.sectionLabel}>Painel Administrativo</div>
          <h1 className={styles.title}>
            Suas <em>configurações</em>
          </h1>
        </div>
      </div>

      <AdminNav />

      {mensagem && (
        <div
          className={`${styles.toast} ${
            mensagem.tipo === "sucesso" ? styles.toastSucesso : styles.toastErro
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* HORÁRIOS DA SEMANA */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Horários de atendimento</h2>
          <button
            onClick={salvarHorarios}
            disabled={savingWhat === "horarios"}
            className={styles.btnSalvar}
          >
            {savingWhat === "horarios" ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        <div className={styles.diasGrid}>
          {DIAS_NOMES.map((nome, diaSemana) => {
            const blocos = blocosPorDia[diaSemana] || [];
            if (blocos.length === 0) return null;

            return (
              <div key={diaSemana} className={styles.diaCard}>
                <h3 className={styles.diaNome}>{nome}</h3>
                <div className={styles.blocosLista}>
                  {blocos.map((bloco, i) => (
                    <div key={bloco.id} className={styles.bloco}>
                      <span className={styles.blocoLabel}>
                        {blocos.length > 1 ? (i === 0 ? "Manhã" : "Tarde") : "Período"}
                      </span>
                      <div className={styles.blocoInputs}>
                        <input
                          type="time"
                          value={bloco.hora_inicio.slice(0, 5)}
                          onChange={(e) =>
                            atualizarBloco(bloco.id, "hora_inicio", e.target.value + ":00")
                          }
                          className={styles.timeInput}
                        />
                        <span className={styles.separador}>—</span>
                        <input
                          type="time"
                          value={bloco.hora_fim.slice(0, 5)}
                          onChange={(e) =>
                            atualizarBloco(bloco.id, "hora_fim", e.target.value + ":00")
                          }
                          className={styles.timeInput}
                        />
                      </div>
                      <label className={styles.ativoToggle}>
                        <input
                          type="checkbox"
                          checked={bloco.ativo}
                          onChange={(e) =>
                            atualizarBloco(bloco.id, "ativo", e.target.checked)
                          }
                        />
                        <span>Ativo</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIAS BLOQUEADOS */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Dias bloqueados</h2>
        </div>

        <div className={styles.bloqueioForm}>
          <input
            type="date"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
            className={styles.dateInput}
          />
          <input
            type="text"
            placeholder="Motivo (opcional)"
            value={novoMotivo}
            onChange={(e) => setNovoMotivo(e.target.value)}
            className={styles.motivoInput}
          />
          <button
            onClick={adicionarBloqueio}
            disabled={savingWhat === "bloqueio" || !novaData}
            className={styles.btnAdd}
          >
            {savingWhat === "bloqueio" ? "Adicionando..." : "Bloquear data"}
          </button>
        </div>

        {bloqueios.length === 0 ? (
          <div className={styles.empty}>
            <p>Nenhum dia bloqueado.</p>
            <span>Use este espaço para marcar feriados ou dias de folga.</span>
          </div>
        ) : (
          <div className={styles.bloqueiosLista}>
            {bloqueios.map((b) => (
              <div key={b.id} className={styles.bloqueioCard}>
                <div className={styles.bloqueioInfo}>
                  <div className={styles.bloqueioData}>
                    {new Date(`${b.data}T12:00:00`).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  {b.motivo && <div className={styles.bloqueioMotivo}>{b.motivo}</div>}
                </div>
                <button
                  onClick={() => removerBloqueio(b.id)}
                  disabled={savingWhat === `bloqueio_${b.id}`}
                  className={styles.btnRemover}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DURAÇÃO DOS SERVIÇOS */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Duração dos serviços</h2>
          <button
            onClick={salvarServicos}
            disabled={savingWhat === "servicos"}
            className={styles.btnSalvar}
          >
            {savingWhat === "servicos" ? "Salvando..." : "Salvar durações"}
          </button>
        </div>

        <div className={styles.servicosGrid}>
          {servicos.map((s) => (
            <div key={s.id} className={styles.servicoCard}>
              <div className={styles.servicoNome}>{s.service_slug}</div>
              <div className={styles.servicoDuracao}>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={s.duracao_minutos}
                  onChange={(e) =>
                    atualizarServico(s.id, Number(e.target.value))
                  }
                  className={styles.numberInput}
                />
                <span className={styles.unidade}>min</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}