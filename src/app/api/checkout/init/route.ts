import { NextResponse } from "next/server";

interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  sizeLabel: string;
  price: number;
  quantity: number;
}

export async function POST(request: Request) {
  const { name, phone, city, address, items, total } = await request.json() as {
    name: string;
    phone: string;
    city: string;
    address: string;
    items: CartItem[];
    total: number;
  };

  const txRef = `morpho-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const body = {
    tx_ref: txRef,
    amount: total,
    currency: "XOF",
    redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/checkout/success`,
    customer: {
      name,
      email: "client@email.com",
      phonenumber: phone,
    },
    meta: {
      city,
      address,
      items: JSON.stringify(items.map((i) => ({ id: i.variantId, qty: i.quantity }))),
    },
    payment_options: "card, mobilemoney, ussd",
  };

  try {
    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.status === "success" && data.data?.link) {
      return NextResponse.json({ url: data.data.link, tx_ref: txRef });
    }

    console.error("Flutterwave init failed:", data);
    return NextResponse.json(
      { error: data.message ?? "Erreur de paiement" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Flutterwave request failed:", err);
    return NextResponse.json(
      { error: "Erreur de connexion au service de paiement" },
      { status: 500 }
    );
  }
}
