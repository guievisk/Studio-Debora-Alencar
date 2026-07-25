import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cliente_nome,
      cliente_whatsapp,
      service_slug,
      service_name,
      data,
      hora_inicio,
      duracao_minutos,
    } = body;

    // Calcula hora_fim
    const [h, m] = hora_inicio.split(":").map(Number);
    const totalMin = h * 60 + m + duracao_minutos;
    const horaFim = `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;

    const { data: agendamento, error } = await supabaseAdmin
      .from("agendamentos")
      .insert({
        cliente_nome,
        cliente_whatsapp,
        service_slug,
        service_name,
        data,
        hora_inicio,
        hora_fim: horaFim,
        duracao_minutos,
        status: "pendente",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar agendamento:", error);
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    return NextResponse.json({ success: true, agendamento });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}