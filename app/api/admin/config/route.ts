import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET - retorna todas as configurações
export async function GET() {
  try {
    const [disponibilidade, bloqueios, servicos] = await Promise.all([
      supabaseAdmin.from("disponibilidade").select("*").order("dia_semana"),
      supabaseAdmin.from("bloqueios").select("*").order("data", { ascending: true }),
      supabaseAdmin.from("servicos_config").select("*").order("service_slug"),
    ]);

    return NextResponse.json({
      disponibilidade: disponibilidade.data || [],
      bloqueios: bloqueios.data || [],
      servicos: servicos.data || [],
    });
  } catch (error) {
    console.error("Erro GET config:", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

// POST - salva alterações
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, dados } = body;

    if (tipo === "disponibilidade") {
      // Atualiza cada bloco
      for (const bloco of dados) {
        const { error } = await supabaseAdmin
          .from("disponibilidade")
          .update({
            hora_inicio: bloco.hora_inicio,
            hora_fim: bloco.hora_fim,
            ativo: bloco.ativo,
          })
          .eq("id", bloco.id);

        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (tipo === "servicos") {
      for (const serv of dados) {
        const { error } = await supabaseAdmin
          .from("servicos_config")
          .update({ duracao_minutos: serv.duracao_minutos })
          .eq("id", serv.id);

        if (error) throw error;
      }
      return NextResponse.json({ success: true });
    }

    if (tipo === "bloqueio_add") {
      const { error } = await supabaseAdmin.from("bloqueios").insert({
        data: dados.data,
        motivo: dados.motivo || null,
      });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (tipo === "bloqueio_remove") {
      const { error } = await supabaseAdmin
        .from("bloqueios")
        .delete()
        .eq("id", dados.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error) {
    console.error("Erro POST config:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}