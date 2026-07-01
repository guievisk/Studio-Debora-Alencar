"use client";

import { useState } from "react";

export default function TesteAgenda() {
  const [resultado, setResultado] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function testar() {
    setLoading(true);
    const hoje = new Date();
    hoje.setDate(hoje.getDate() + 1);
    const amanha = hoje.toISOString().split("T")[0];

    const res = await fetch("/api/agendar/disponibilidade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_slug: "fio-classico",
        data: amanha,
      }),
    });

    const data = await res.json();
    setResultado(JSON.stringify(data, null, 2));
    setLoading(false);
  }

  return (
    <div style={{ padding: "3rem", fontFamily: "system-ui" }}>
      <h1>Teste de Disponibilidade</h1>
      <button onClick={testar} disabled={loading}>
        {loading ? "Carregando..." : "Buscar horários de amanhã (fio-clássico)"}
      </button>
      <pre style={{ marginTop: "2rem", background: "#f0f0f0", padding: "1rem" }}>
        {resultado}
      </pre>
    </div>
  );
}