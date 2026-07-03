import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, nome, email, foto_url } = body;

    if (!user_id) {
      return NextResponse.json({ error: "user_id obrigatório" }, { status: 400 });
    }

    // Verifica se já existe
    const { data: existente } = await supabaseAdmin
      .from("clientes")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existente) {
      // Atualiza foto se mudou
      if (foto_url && foto_url !== existente.foto_url) {
        await supabaseAdmin
          .from("clientes")
          .update({ foto_url })
          .eq("user_id", user_id);
        existente.foto_url = foto_url;
      }
      return NextResponse.json({ cliente: existente });
    }

    // Cria novo
    const { data: novo, error } = await supabaseAdmin
      .from("clientes")
      .insert({ user_id, nome, email, foto_url })
      .select()
      .single();

    if (error) {
      console.error("Erro criar cliente:", error);
      return NextResponse.json({ error: "Erro ao criar perfil" }, { status: 500 });
    }

    return NextResponse.json({ cliente: novo });
  } catch (error) {
    console.error("Erro cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}