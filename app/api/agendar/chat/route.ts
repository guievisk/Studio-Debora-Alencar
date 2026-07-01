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

3. HORÁRIO - DEPENDE DO QUE O CLIENTE DISSE:

   CENÁRIO A — Cliente JÁ disse o horário (ex: "quero às 15", "amanhã às 16:00", "dia 5 às 10"):
   → Use check_disponibilidade pra verificar se AQUELE horário específico está na lista.
   → Se estiver, confirme IMEDIATAMENTE: "Horário disponível! Preciso do seu nome e WhatsApp."
   → NÃO mostre outros horários. NÃO sugira alternativas. Confirme e siga.
   → Se NÃO estiver, diga que não tem e pergunte se quer outro horário ou outro dia.

   CENÁRIO B — Cliente NÃO disse horário (ex: "quero amanhã", "que horários tem?"):
   → Use check_disponibilidade.
   → Mostre NO MÁXIMO 3 horários espalhados de "sugerir_estes_3".
   → NÃO mostre a lista completa. Aguarde o cliente escolher.

   CENÁRIO C — Cliente pediu horário que NÃO está nos 3 sugeridos:
   → Verifique em "todos_horarios_disponiveis".
   → Se existir, confirme. Se não, diga que não tem.

4. COLETA DE DADOS:
   Peça nome completo E WhatsApp (com DDD) NA MESMA mensagem.
   Espere receber OS DOIS antes de continuar.

5. CONFIRMAR AGENDAMENTO:
   Quando tiver serviço, data, horário, nome e WhatsApp, chame criar_agendamento UMA VEZ.
   NÃO chame check_disponibilidade nesta etapa.
   Se sucesso, confirme com todos os dados.

REGRAS ABSOLUTAS:
- NUNCA mostre horários se o cliente já disse qual quer. Só verifique e confirme.
- NUNCA chame criar_agendamento sem nome E WhatsApp.
- NUNCA chame check_disponibilidade depois que o cliente já escolheu horário.
- NUNCA invente horários — só use os da lista retornada.
- Quando cliente disser número solto ("15", "16", "as 3"), interprete como horário (15:00, 16:00, 15:00).
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
        "Verifica horários disponíveis para um serviço em uma data específica",
      parameters: {
        type: "object",
        properties: {
          data: {
            type: "string",
            description: "Data no formato YYYY-MM-DD",
          },
          service_slug: {
            type: "string",
            description: "Slug do serviço",
          },
        },
        required: ["data", "service_slug"],
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
          cliente_nome: {
            type: "string",
            description: "Nome completo do cliente",
          },
          cliente_whatsapp: {
            type: "string",
            description: "WhatsApp com DDD",
          },
          service_slug: {
            type: "string",
            description: "Slug do serviço",
          },
          service_name: {
            type: "string",
            description: "Nome do serviço",
          },
          data: {
            type: "string",
            description: "Data YYYY-MM-DD",
          },
          hora_inicio: {
            type: "string",
            description: "Horário escolhido HH:MM",
          },
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
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
// 4. EXECUTAR TOOLS
// ============================================
async function executeTool(
  name: string,
  args: Record<string, string>
): Promise<Record<string, unknown>> {
  // --- CHECAR DISPONIBILIDADE ---
  if (name === "check_disponibilidade") {
    const { data: dataStr, service_slug } = args;
    const dataSolicitada = new Date(dataStr + "T00:00:00");
    const diaSemana = dataSolicitada.getDay();

    // Dia bloqueado?
    const { data: bloqueio } = await supabaseAdmin
      .from("bloqueios")
      .select("id")
      .eq("data", dataStr)
      .maybeSingle();

    if (bloqueio) {
      return { disponivel: false, motivo: "Dia bloqueado", slots: [] };
    }

    // Dia da semana ativo? (pode ter múltiplos blocos: manhã e tarde)
    const { data: blocos } = await supabaseAdmin
      .from("disponibilidade")
      .select("*")
      .eq("dia_semana", diaSemana)
      .eq("ativo", true);

    if (!blocos || blocos.length === 0) {
      return {
        disponivel: false,
        motivo: "Sem atendimento neste dia da semana",
        slots: [],
      };
    }

    // Duração do serviço?
    const { data: config } = await supabaseAdmin
      .from("servicos_config")
      .select("duracao_minutos")
      .eq("service_slug", service_slug)
      .single();

    if (!config) {
      return { disponivel: false, motivo: "Serviço não encontrado", slots: [] };
    }

    // Agendamentos existentes no dia
    const { data: agendamentos } = await supabaseAdmin
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("data", dataStr)
      .in("status", ["pendente", "confirmado"]);

    // Calcula slots livres em TODOS os blocos (manhã + tarde)
    const todosSlots: string[] = [];
    for (const bloco of blocos) {
      const slots = calcularSlotsLivres(
        bloco.hora_inicio,
        bloco.hora_fim,
        config.duracao_minutos,
        agendamentos || []
      );
      todosSlots.push(...slots);
    }

    // Escolhe 3 espalhados pra sugerir
    const sugeridos: string[] = [];
    if (todosSlots.length <= 3) {
      sugeridos.push(...todosSlots);
    } else {
      sugeridos.push(todosSlots[0]);
      sugeridos.push(todosSlots[Math.floor(todosSlots.length / 2)]);
      sugeridos.push(todosSlots[todosSlots.length - 1]);
    }

    return {
      disponivel: todosSlots.length > 0,
      sugerir_estes_3: sugeridos,
      todos_horarios_disponiveis: todosSlots,
      total_horarios: todosSlots.length,
      duracao_minutos: config.duracao_minutos,
      instrucao: "Sugira APENAS os horários de 'sugerir_estes_3'. Se o cliente pedir outro horário, verifique se existe em 'todos_horarios_disponiveis'. SÓ diga que não tem se NÃO estiver em 'todos_horarios_disponiveis'.",
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
      hora_inicio,
    } = args;

    // Buscar duração
    const { data: config } = await supabaseAdmin
      .from("servicos_config")
      .select("duracao_minutos")
      .eq("service_slug", service_slug)
      .single();

    if (!config) return { success: false, error: "Serviço não encontrado" };

    const duracao = config.duracao_minutos;
    const [h, m] = hora_inicio.split(":").map(Number);
    const inicioMin = h * 60 + m;
    const fimMin = inicioMin + duracao;
    const hora_fim = minutesToTime(fimMin);

    // Double-check conflito
    const { data: existentes } = await supabaseAdmin
      .from("agendamentos")
      .select("hora_inicio, hora_fim")
      .eq("data", data)
      .in("status", ["pendente", "confirmado"]);

    const conflita = (existentes || []).some((ag) => {
      const agInicio = timeToMinutes(ag.hora_inicio);
      const agFim = timeToMinutes(ag.hora_fim);
      return inicioMin < agFim && fimMin > agInicio;
    });

    if (conflita) {
      return { success: false, error: "Horário já foi reservado" };
    }

    // Salvar
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
        duracao_minutos: duracao,
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
// 5. ENDPOINT PRINCIPAL
// ============================================
export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages é obrigatório" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Cache de disponibilidade pra não rechecar o mesmo dia
    const disponibilidadeCache: Record<string, Record<string, unknown>> = {};

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
        let resultado: Record<string, unknown>;

        // Se for check_disponibilidade e já checou esse dia, usa cache
        if (toolCall.function.name === "check_disponibilidade") {
          const cacheKey = `${args.service_slug}_${args.data}`;
          if (disponibilidadeCache[cacheKey]) {
            resultado = disponibilidadeCache[cacheKey];
          } else {
            resultado = await executeTool(toolCall.function.name, args);
            disponibilidadeCache[cacheKey] = resultado;
          }
        } else {
          resultado = await executeTool(toolCall.function.name, args);
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
    console.error("Erro no chat de agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}