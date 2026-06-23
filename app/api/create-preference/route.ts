import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, price, slug } = body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: slug,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/servicos`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/servicos`,
        },
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error("Erro ao criar preferência:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento" },
      { status: 500 }
    );
  }
}