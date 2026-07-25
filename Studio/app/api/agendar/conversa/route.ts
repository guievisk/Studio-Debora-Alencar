import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET — carrega conversa do cliente
export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id obrigatório" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("conversas")
    .select("messages")
    .eq("user_id", user_id)
    .maybeSingle();

  return NextResponse.json({ messages: data?.messages || [] });
}

// POST — salva conversa do cliente
export async function POST(request: NextRequest) {
  try {
    const { user_id, messages } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "user_id obrigatório" }, { status: 400 });
    }

    // Verifica se já existe
    const { data: existente } = await supabaseAdmin
      .from("conversas")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existente) {
      await supabaseAdmin
        .from("conversas")
        .update({ messages, updated_at: new Date().toISOString() })
        .eq("user_id", user_id);
    } else {
      await supabaseAdmin
        .from("conversas")
        .insert({ user_id, messages });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro conversa:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}