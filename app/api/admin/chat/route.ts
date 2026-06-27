import { groq } from "@/lib/groq";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    const { data: pagamentos } = await supabaseAdmin
      .from("pagamentos")
      .select("*")
      .order("created_at", { ascending: false });

    const lista = pagamentos || [];

    const aprovados = lista.filter((p) => p.status === "approved");
    const totalFaturado = aprovados.reduce((s, p) => s + (p.amount || 0), 0);
    const totalAprovados = aprovados.length;
    const totalPagamentos = lista.length;

    const contagem: Record<string, number> = {};
    aprovados.forEach((p) => {
      const nome = p.service_name || "Desconhecido";
      contagem[nome] = (contagem[nome] || 0) + 1;
    });
    const maisVendido = Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])[0];

    const ultimos = lista.slice(0, 10).map((p) => ({
      servico: p.service_name,
      valor: p.amount,
      status: p.status,
      data: p.created_at,
      cliente: p.customer_name,
    }));

    const systemPrompt = `Você é uma assistente de negócios especializada em clínicas de estética.
Seu nome é Luna. Você ajuda a Débora Alencar, dona da clínica "Débora Alencar Beauty" em Goiânia-GO.
A clínica oferece extensão de cílios, design de sobrancelhas, lash lifting e tratamento de estrias.

DADOS ATUAIS DA CLÍNICA:
- Faturamento total (aprovados): R$ ${totalFaturado.toFixed(2)}
- Pagamentos aprovados: ${totalAprovados}
- Total de transações: ${totalPagamentos}
- Serviço mais vendido: ${maisVendido ? `${maisVendido[0]} (${maisVendido[1]}x)` : "Nenhum ainda"}

ÚLTIMAS TRANSAÇÕES:
${JSON.stringify(ultimos, null, 2)}

REGRAS:
- Responda sempre em português brasileiro
- Seja direta e prática
- Dê conselhos acionáveis baseados nos dados
- Quando não tiver dados suficientes, diga isso
- Use emojis com moderação
- Trate a Débora com carinho, ela é sua cliente`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sem resposta";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Erro Groq:", error);
    return NextResponse.json(
      { error: "Erro ao processar pergunta" },
      { status: 500 }
    );
  }
}