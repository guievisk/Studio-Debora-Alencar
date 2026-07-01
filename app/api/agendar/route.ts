import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { data: dataStr, service_slug } = await request.json();

    // Validação básica
    if (!dataStr || !service_slug) {
      return NextResponse.json(
        { error: "data e service_slug são obrigatórios" },
        { status: 400 }
      );
    }

    const dataSolicitada = new Date(dataStr + "T00:00:00");
    const diaSemana = dataSolicitada.getDay(); // 0=dom, 1=seg, ..., 6=sab

    // 1. Verificar se o dia está bloqueado
    const { data: bloqueio } = await supabaseAdmin
      .from("bloqueios")
      .select("id")
      .eq("data", dataStr)
      .single();

    if (bloqueio) {
      return NextResponse.json({
        disponivel: false,
        motivo: "Este dia não está disponível para agendamento.",
        slots: [],
      });
    }

    // 2. Buscar disponibilidade do dia da semana
    const { data: disp } = await supabaseAdmin
      .from("disponibilidade")
      .select("*")
      .eq("dia_semana", diaSemana)
      .eq("ativo", true)
      .single();

    if (!disp) {
      return NextResponse.json({
        disponivel: false,
        motivo: "Não há atendimento neste dia da semana.",
        slots: [],
      });
    }

    // 3. Buscar duração do serviço
    const { data: servicoConfig } = await supabaseAdmin
      .from("servicos_config")
      .select("duracao_minutos")
      .eq("service_slug", service_slug)
      .single();

    if (!servicoConfig) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const duracao = servicoConfig.duracao_minutos;

    // 4. Buscar agendamentos existentes no dia (só pendentes e confirmados)
    const { data: agendamentos } = await supabaseAdmin
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("data", dataStr)
      .in("status", ["pendente", "confirmado"]);

    const ocupados = agendamentos || [];

    // 5. Gerar slots livres
    const slots = calcularSlotsLivres(
      disp.hora_inicio,   // ex: "09:00:00"
      disp.hora_fim,      // ex: "18:00:00"
      duracao,            // ex: 120
      ocupados            // ex: [{hora_inicio: "10:00", hora_fim: "12:00"}]
    );

    return NextResponse.json({
      disponivel: slots.length > 0,
      slots,
      duracao_minutos: duracao,
    });
  } catch (error) {
    console.error("Erro ao buscar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Converte "09:00:00" em minutos desde meia-noite (540)
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Converte minutos (540) de volta pra "09:00"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// O coração: calcula quais horários estão livres
function calcularSlotsLivres(
  inicioExpediente: string,
  fimExpediente: string,
  duracaoMinutos: number,
  ocupados: { hora_inicio: string; hora_fim: string }[]
): string[] {
  const inicio = timeToMinutes(inicioExpediente);
  const fim = timeToMinutes(fimExpediente);

  // Converte agendamentos existentes pra minutos
  const blocos = ocupados.map((a) => ({
    inicio: timeToMinutes(a.hora_inicio),
    fim: timeToMinutes(a.hora_fim),
  }));

  // Ordena por início
  blocos.sort((a, b) => a.inicio - b.inicio);

  const slots: string[] = [];

  // Tenta encaixar a cada 30 minutos dentro do expediente
  for (let cursor = inicio; cursor + duracaoMinutos <= fim; cursor += 30) {
    const candidatoFim = cursor + duracaoMinutos;

    // Verifica se esse slot conflita com algum agendamento existente
    const conflita = blocos.some(
      (bloco) => cursor < bloco.fim && candidatoFim > bloco.inicio
    );

    if (!conflita) {
      slots.push(minutesToTime(cursor));
    }
  }

  return slots;
}