import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = process.env.FLW_WEBHOOK_SECRET;
  const signature = request.headers.get("verif-hash");

  if (secret && signature !== secret) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = await request.json();

  if (payload.event === "charge.completed" && payload.data?.status === "successful") {
    const txRef = payload.data.tx_ref;
    const flwId = payload.data.id;
    const amount = payload.data.amount;
    const currency = payload.data.currency;
    const paymentMethod = payload.data.payment_type;

    try {
      const supabase = await createClient();

      const { data: order } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_ref: String(flwId),
          payment_method: paymentMethod?.toLowerCase() ?? null,
        })
        .eq("payment_ref", txRef)
        .select()
        .single();

      if (!order) {
        console.warn("Webhook: order not found for tx_ref", txRef);
      }
    } catch (err) {
      console.error("Webhook error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
