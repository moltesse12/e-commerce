import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  const secret = process.env.FLW_WEBHOOK_SECRET;

  if (!secret) {
    console.error("Webhook: FLW_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("verif-hash");
  if (signature !== secret) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = await request.json();

  if (payload.event === "charge.completed" && payload.data?.status === "successful") {
    const txRef = payload.data.tx_ref;
    const flwId = payload.data.id;
    const paymentMethod = payload.data.payment_type;

    try {
      const supabase = getServiceClient();

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
