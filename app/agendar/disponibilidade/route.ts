import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Intervalo entre slots (em minutos)
const SLOT_INTERVAL = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_slug, data } = body;

    if (!service_slug || !data) {
      return NextResponse.json(
        { error: "service_slug e data são obrigatórios" },
        { status: 400 }
      );
    }

    // 1. Descobre o dia da semana (0 = domingo, 6 = sábado)
    const diaSemana = new Date(`${data}T12:00:00`).getDay();

    // 2. Verifica se a data está bloqueada (feriado/férias)
    const { data: bloqueio } = await supabaseAdmin
      .from("bloqueios")
      .select("data")
      .eq("data", data)
      .maybeSingle();

    if (bloqueio) {
      return NextResponse.json({ horarios: [], motivo: "Dia indisponível" });
    }

    // 3. Busca os blocos de disponibilidade do dia
    const { data: blocos } = await supabaseAdmin
      .from("disponibilidade")
      .select("hora_inicio, hora_fim")
      .eq("dia_semana", diaSemana)
      .eq("ativo", true);

    if (!blocos || blocos.length === 0) {
      return NextResponse.json({ horarios: [], motivo: "Sem atendimento nesse dia" });
    }

    // 4. Busca a duração do serviço
    const { data: servico } = await supabaseAdmin
      .from("servicos_config")
      .select("duracao_minutos")
      .eq("service_slug", service_slug)
      .maybeSingle();

    if (!servico) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const duracao = servico.duracao_minutos;

    // 5. Busca os agendamentos da data (que não foram cancelados)
    const { data: agendados } = await supabaseAdmin
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("data", data)
      .neq("status", "cancelado");

    const ocupados = (agendados || []).map((a) => ({
      inicio: timeToMinutes(a.hora_inicio),
      fim: timeToMinutes(a.hora_fim),
    }));

    // 6. Gera todos os slots possíveis dentro dos blocos
    const horarios: string[] = [];
    const agora = new Date();
    const dataObj = new Date(`${data}T00:00:00`);
    const ehHoje = dataObj.toDateString() === agora.toDateString();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    for (const bloco of blocos) {
      const inicioBloco = timeToMinutes(bloco.hora_inicio);
      const fimBloco = timeToMinutes(bloco.hora_fim);

      let slotAtual = inicioBloco;

      while (slotAtual + duracao <= fimBloco) {
        const slotFim = slotAtual + duracao;

        // Verifica conflito com agendamentos existentes
        const temConflito = ocupados.some(
          (oc) => slotAtual < oc.fim && slotFim > oc.inicio
        );

        // Se for hoje, ignora slots que já passaram
        const jaPassou = ehHoje && slotAtual <= minutosAgora;

        if (!temConflito && !jaPassou) {
          horarios.push(minutesToTime(slotAtual));
        }

        slotAtual += SLOT_INTERVAL;
      }
    }

    return NextResponse.json({ horarios, duracao });
  } catch (error) {
    console.error("Erro disponibilidade:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// Converte "14:30" em 870 (14*60 + 30)
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Converte 870 em "14:30"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}