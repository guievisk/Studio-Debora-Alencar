import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Webhook recebido:", body);

    // MP manda diferentes tipos de notificação, só queremos "payment"
    if (body.type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Sem ID de pagamento" }, { status: 400 });
    }

    // Busca detalhes do pagamento no Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log("Pagamento:", paymentData);

    // Salva no Supabase
    const { error } = await supabaseAdmin
      .from("pagamentos")
      .upsert(
        {
          payment_id: String(paymentData.id),
          service_slug: paymentData.additional_info?.items?.[0]?.id || null,
          service_name: paymentData.additional_info?.items?.[0]?.title || null,
          amount: paymentData.transaction_amount || null,
          status: paymentData.status || "unknown",
          customer_name: paymentData.payer?.first_name
            ? `${paymentData.payer.first_name} ${paymentData.payer.last_name || ""}`.trim()
            : null,
          customer_email: paymentData.payer?.email || null,
          customer_phone: paymentData.payer?.phone?.number || null,
        },
        { onConflict: "payment_id" }
      );

    if (error) {
      console.error("Erro ao salvar:", error);
      return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}