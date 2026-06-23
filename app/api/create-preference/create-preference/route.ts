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
    notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/webhook/mercadopago`,
  },
});