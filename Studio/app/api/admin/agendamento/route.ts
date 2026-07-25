import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const { id, action, data, hora_inicio, service_slug } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "id e action são obrigatórios" }, { status: 400 });
    }

    // --- CONFIRMAR ---
    if (action === "confirmar") {
      const { error } = await supabaseAdmin
        .from("agendamentos")
        .update({ status: "confirmado" })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "confirmado" });
    }

    // --- CANCELAR ---
    if (action === "cancelar") {
      const { error } = await supabaseAdmin
        .from("agendamentos")
        .update({ status: "cancelado" })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "cancelado" });
    }

    // --- EDITAR (remarcar) ---
    if (action === "editar") {
      if (!data || !hora_inicio) {
        return NextResponse.json({ error: "data e hora_inicio são obrigatórios pra editar" }, { status: 400 });
      }

      // Buscar duração do serviço
      const slug = service_slug;
      const { data: config } = await supabaseAdmin
        .from("servicos_config")
        .select("duracao_minutos")
        .eq("service_slug", slug)
        .single();

      if (!config) {
        return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
      }

      const duracao = config.duracao_minutos;
      const [h, m] = hora_inicio.split(":").map(Number);
      const inicioMin = h * 60 + m;
      const fimMin = inicioMin + duracao;
      const hora_fim = `${String(Math.floor(fimMin / 60)).padStart(2, "0")}:${String(fimMin % 60).padStart(2, "0")}`;

      // Verificar conflito (ignorando o próprio agendamento)
      const { data: existentes } = await supabaseAdmin
        .from("agendamentos")
        .select("hora_inicio, hora_fim")
        .eq("data", data)
        .neq("id", id)
        .in("status", ["pendente", "confirmado"]);

      const conflita = (existentes || []).some((ag) => {
        const [ah, am] = ag.hora_inicio.split(":").map(Number);
        const [bh, bm] = ag.hora_fim.split(":").map(Number);
        const agInicio = ah * 60 + am;
        const agFim = bh * 60 + bm;
        return inicioMin < agFim && fimMin > agInicio;
      });

      if (conflita) {
        return NextResponse.json({ error: "Horário conflita com outro agendamento" }, { status: 409 });
      }

      const { error } = await supabaseAdmin
        .from("agendamentos")
        .update({ data, hora_inicio, hora_fim, duracao_minutos: duracao })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, hora_fim });
    }

    return NextResponse.json({ error: "action inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao atualizar agendamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}