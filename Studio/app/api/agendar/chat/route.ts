import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { categories } from "@/data/services";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ============================================
// 1. SYSTEM PROMPT
// ============================================
const servicosList = categories
  .flatMap((cat) => cat.services)
  .map((s) => `- ${s.name} (slug: ${s.slug})`)
  .join("\n");

const hoje = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const systemPrompt = `Você é Luna, assistente virtual da Débora Alencar Beauty, clínica de estética em Goiânia-GO.

Seu papel é ajudar clientes a agendar serviços. Seja simpática, profissional e objetiva.

SERVIÇOS DISPONÍVEIS:
${servicosList}

FLUXO DE CONVERSA:

1. CUMPRIMENTO: Cumprimente e pergunte qual serviço e quando o cliente gostaria de agendar.

2. IDENTIFICAÇÃO: Identifique o serviço e a data. Se o cliente for vago ("quero cílios"), pergunte qual tipo.

3. HORÁRIO:
   - Se o cliente ainda NÃO disse horário: pergunte "Que horário você prefere?".
   - Se o cliente perguntar quais horários existem ("quais horários?", "que horários tem?"): chame check_disponibilidade e sugira os horários de "sugerir_estes_3".
   - Se o cliente citar um horário específico ("às 8", "14h", "10 da manhã"): chame SEMPRE verificar_horario com aquele horário e responda EXATAMENTE conforme o campo "disponivel" retornado. NUNCA diga que um horário está livre sem chamar verificar_horario antes.

REGRAS DE FERRAMENTAS (OBRIGATÓRIAS):
- NUNCA invente ou deduza horários. Só afirme que um horário existe/está livre se uma ferramenta confirmou.
- Sempre que o cliente citar um horário, chame verificar_horario ANTES de responder. Se "disponivel" for false, diga que não está disponível e ofereça os horários de "sugerir_alternativos".
- Para criar o agendamento você precisa de: serviço, data, horário confirmado, nome E WhatsApp. Só então chame criar_agendamento UMA ÚNICA VEZ.
- Depois de criar_agendamento retornar "success", apenas confirme os dados ao cliente. NÃO chame nenhuma ferramenta de novo.
- Se criar_agendamento retornar erro, explique o motivo e ofereça os horários alternativos retornados.

OUTRAS REGRAS:
- Quando o cliente disser um número solto ("15", "16", "as 3"), interprete como horário (15:00, 16:00, 15:00).
- Respostas curtas e diretas. No máximo 1 emoji por mensagem.
- Português brasileiro.

HOJE É: ${hoje}`;

// ============================================
// 2. TOOLS
// ============================================
const tools: Groq.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "check_disponibilidade",
      description:
        "Retorna a lista de horários livres de um serviço numa data. Use quando o cliente pedir para ver as opções de horário.",
      parameters: {
        type: "object",
        properties: {
          data: { type: "string", description: "Data no formato YYYY-MM-DD" },
          service_slug: { type: "string", description: "Slug do serviço" },
        },
        required: ["data", "service_slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "verificar_horario",
      description:
        "Verifica se UM horário específico está livre para um serviço numa data. Use SEMPRE que o cliente citar um horário específico.",
      parameters: {
        type: "object",
        properties: {
          data: { type: "string", description: "Data no formato YYYY-MM-DD" },
          service_slug: { type: "string", description: "Slug do serviço" },
          hora: { type: "string", description: "Horário citado pelo cliente, formato HH:MM" },
        },
        required: ["data", "service_slug", "hora"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "criar_agendamento",
      description:
        "Cria um agendamento após o cliente confirmar horário, nome e WhatsApp",
      parameters: {
        type: "object",
        properties: {
          cliente_nome: { type: "string", description: "Nome completo do cliente" },
          cliente_whatsapp: { type: "string", description: "WhatsApp com DDD" },
          service_slug: { type: "string", description: "Slug do serviço" },
          service_name: { type: "string", description: "Nome do serviço" },
          data: { type: "string", description: "Data YYYY-MM-DD" },
          hora_inicio: { type: "string", description: "Horário escolhido HH:MM" },
        },
        required: [
          "cliente_nome",
          "cliente_whatsapp",
          "service_slug",
          "service_name",
          "data",
          "hora_inicio",
        ],
      },
    },
  },
];

// ============================================
// 3. HELPERS
// ============================================
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Normaliza "8", "8:0", "08:00" -> "08:00". Retorna null se inválido.
function normalizeHora(raw: string): string | null {
  if (!raw) return null;
  const match = String(raw).trim().match(/^(\d{1,2})(?::(\d{1,2}))?/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2] || 0);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return minutesToTime(h * 60 + m);
}

function calcularSlotsLivres(
  inicioExpediente: string,
  fimExpediente: string,
  duracaoMinutos: number,
  ocupados: { hora_inicio: string; hora_fim: string }[]
): string[] {
  const inicio = timeToMinutes(inicioExpediente);
  const fim = timeToMinutes(fimExpediente);

  const blocos = ocupados.map((a) => ({
    inicio: timeToMinutes(a.hora_inicio),
    fim: timeToMinutes(a.hora_fim),
  }));
  blocos.sort((a, b) => a.inicio - b.inicio);

  const slots: string[] = [];
  for (let cursor = inicio; cursor + duracaoMinutos <= fim; cursor += 30) {
    const candidatoFim = cursor + duracaoMinutos;
    const conflita = blocos.some(
      (bloco) => cursor < bloco.fim && candidatoFim > bloco.inicio
    );
    if (!conflita) {
      slots.push(minutesToTime(cursor));
    }
  }
  return slots;
}

// ============================================
// 4. FONTE ÚNICA DE VERDADE: calcula slots livres reais
// ============================================
type Disponibilidade = {
  ok: boolean;
  motivo: string;
  slots: string[];
  duracao: number;
};

async function getDisponibilidade(
  dataStr: string,
  service_slug: string
): Promise<Disponibilidade> {
  // meio-dia evita que fuso horário (UTC no servidor) mude o dia da semana
  const diaSemana = new Date(`${dataStr}T12:00:00`).getDay();

  // Dia bloqueado?
  const { data: bloqueio } = await supabaseAdmin
    .from("bloqueios")
    .select("id")
    .eq("data", dataStr)
    .maybeSingle();

  if (bloqueio) {
    return { ok: false, motivo: "Dia bloqueado", slots: [], duracao: 0 };
  }

  // Blocos de atendimento do dia (manhã e tarde)
  const { data: blocos } = await supabaseAdmin
    .from("disponibilidade")
    .select("*")
    .eq("dia_semana", diaSemana)
    .eq("ativo", true);

  if (!blocos || blocos.length === 0) {
    return {
      ok: false,
      motivo: "Sem atendimento neste dia da semana",
      slots: [],
      duracao: 0,
    };
  }

  // Duração do serviço
  const { data: config } = await supabaseAdmin
    .from("servicos_config")
    .select("duracao_minutos")
    .eq("service_slug", service_slug)
    .maybeSingle();

  if (!config) {
    return { ok: false, motivo: "Serviço não encontrado", slots: [], duracao: 0 };
  }

  // Agendamentos que ocupam a data (pendentes e confirmados)
  const { data: agendamentos } = await supabaseAdmin
    .from("agendamentos")
    .select("hora_inicio, hora_fim")
    .eq("data", dataStr)
    .in("status", ["pendente", "confirmado"]);

  // Slots livres em todos os blocos
  let todosSlots: string[] = [];
  for (const bloco of blocos) {
    todosSlots.push(
      ...calcularSlotsLivres(
        bloco.hora_inicio,
        bloco.hora_fim,
        config.duracao_minutos,
        agendamentos || []
      )
    );
  }

  // Se a data for hoje, remove horários que já passaram
  const agora = new Date();
  const ehHoje =
    new Date(`${dataStr}T00:00:00`).toDateString() === agora.toDateString();
  if (ehHoje) {
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    todosSlots = todosSlots.filter((s) => timeToMinutes(s) > minutosAgora);
  }

  // Ordena e remove duplicados
  todosSlots = Array.from(new Set(todosSlots)).sort(
    (a, b) => timeToMinutes(a) - timeToMinutes(b)
  );

  return {
    ok: todosSlots.length > 0,
    motivo: todosSlots.length > 0 ? "" : "Sem horários livres nesta data",
    slots: todosSlots,
    duracao: config.duracao_minutos,
  };
}

function sugerir3(slots: string[]): string[] {
  if (slots.length <= 3) return [...slots];
  return [
    slots[0],
    slots[Math.floor(slots.length / 2)],
    slots[slots.length - 1],
  ];
}

// ============================================
// 5. EXECUTAR TOOLS
// ============================================
async function executeTool(
  name: string,
  args: Record<string, string>
): Promise<Record<string, unknown>> {
  // --- CHECAR DISPONIBILIDADE (lista) ---
  if (name === "check_disponibilidade") {
    const disp = await getDisponibilidade(args.data, args.service_slug);
    if (!disp.ok) {
      return { disponivel: false, motivo: disp.motivo, sugerir_estes_3: [] };
    }
    return {
      disponivel: true,
      sugerir_estes_3: sugerir3(disp.slots),
      todos_horarios_disponiveis: disp.slots,
      total_horarios: disp.slots.length,
      duracao_minutos: disp.duracao,
      instrucao:
        "Sugira os horários de 'sugerir_estes_3'. Se o cliente pedir outro, use verificar_horario para confirmar.",
    };
  }

  // --- VERIFICAR UM HORÁRIO ESPECÍFICO (determinístico) ---
  if (name === "verificar_horario") {
    const hora = normalizeHora(args.hora);
    if (!hora) {
      return { disponivel: false, motivo: "Horário inválido", hora: args.hora };
    }
    const disp = await getDisponibilidade(args.data, args.service_slug);
    if (!disp.ok) {
      return {
        disponivel: false,
        motivo: disp.motivo,
        hora,
        sugerir_alternativos: [],
      };
    }
    const livre = disp.slots.includes(hora);
    return {
      disponivel: livre,
      hora,
      motivo: livre ? "Horário livre" : "Este horário não está disponível",
      sugerir_alternativos: livre ? [] : sugerir3(disp.slots),
    };
  }

  // --- CRIAR AGENDAMENTO ---
  if (name === "criar_agendamento") {
    const {
      cliente_nome,
      cliente_whatsapp,
      service_slug,
      service_name,
      data,
    } = args;

    const hora_inicio = normalizeHora(args.hora_inicio);
    if (!hora_inicio) {
      return { success: false, error: "Horário inválido" };
    }

    // Idempotência: se já existe um agendamento igual (mesmo cliente/data/hora),
    // não cria de novo — apenas confirma o que já existe.
    const { data: jaExiste } = await supabaseAdmin
      .from("agendamentos")
      .select("*")
      .eq("data", data)
      .eq("hora_inicio", hora_inicio)
      .eq("service_slug", service_slug)
      .eq("cliente_whatsapp", cliente_whatsapp)
      .in("status", ["pendente", "confirmado"])
      .maybeSingle();

    if (jaExiste) {
      return { success: true, agendamento: jaExiste, ja_existia: true };
    }

    // Valida que o horário é realmente um slot livre e válido
    const disp = await getDisponibilidade(data, service_slug);
    if (!disp.ok) {
      return { success: false, error: disp.motivo, sugerir_alternativos: [] };
    }
    if (!disp.slots.includes(hora_inicio)) {
      return {
        success: false,
        error: "Horário indisponível",
        sugerir_alternativos: sugerir3(disp.slots),
      };
    }

    const hora_fim = minutesToTime(timeToMinutes(hora_inicio) + disp.duracao);

    const { data: agendamento, error } = await supabaseAdmin
      .from("agendamentos")
      .insert({
        cliente_nome,
        cliente_whatsapp,
        service_slug,
        service_name,
        data,
        hora_inicio,
        hora_fim,
        duracao_minutos: disp.duracao,
        status: "pendente",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, agendamento };
  }

  return { error: "Ferramenta desconhecida" };
}

// ============================================
// 6. ENDPOINT PRINCIPAL
// ============================================
export async function POST(request: NextRequest) {
  try {
    const { messages, cliente } = await request.json();
    const clienteInfo = cliente
      ? `\n\nCLIENTE LOGADO:\n- Nome: ${cliente.nome}\n- Email: ${cliente.email}\n- WhatsApp: ${cliente.whatsapp || "NÃO INFORMADO"}\n\nSe o WhatsApp já está informado, NÃO peça de novo. Use os dados que já tem.\nSe o WhatsApp NÃO está informado, peça apenas o WhatsApp (nome e email você já tem).`
      : "";

    const promptFinal = systemPrompt + clienteInfo;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages é obrigatório" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMessages: any[] = [
      { role: "system", content: promptFinal },
      ...messages,
    ];

    // Cache por request para não rechecar o mesmo dia/serviço
    const dispCache: Record<string, Record<string, unknown>> = {};
    // Guarda o agendamento criado para responder de forma idempotente
    let agendamentoCriado: Record<string, unknown> | null = null;

    let iteracoes = 5;

    while (iteracoes > 0) {
      iteracoes--;

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: currentMessages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.3,
      });

      const message = response.choices[0].message;

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return NextResponse.json({ reply: message.content });
      }

      currentMessages.push(message);

      for (const toolCall of message.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const fnName = toolCall.function.name;
        let resultado: Record<string, unknown>;

        if (fnName === "criar_agendamento" && agendamentoCriado) {
          // Já foi criado neste request: não cria de novo (evita conflito falso)
          resultado = { success: true, agendamento: agendamentoCriado, ja_existia: true };
        } else if (fnName === "check_disponibilidade" || fnName === "verificar_horario") {
          const cacheKey = `${fnName}_${args.service_slug}_${args.data}_${args.hora || ""}`;
          if (dispCache[cacheKey]) {
            resultado = dispCache[cacheKey];
          } else {
            resultado = await executeTool(fnName, args);
            dispCache[cacheKey] = resultado;
          }
        } else {
          resultado = await executeTool(fnName, args);
          if (fnName === "criar_agendamento" && resultado.success) {
            agendamentoCriado = resultado.agendamento as Record<string, unknown>;
          }
        }

        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(resultado),
        });
      }
    }

    return NextResponse.json(
      { error: "Limite de iterações atingido" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Erro no chat de agendamento:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
