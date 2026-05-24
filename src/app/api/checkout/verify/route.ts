import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { tx_ref, order } = await request.json() as {
    tx_ref: string;
    order: { items: { variantId: string; quantity: number; price: number }[]; name: string; phone: string; city: string; address: string; total: number } | null;
  };

  try {
    const res = await fetch(
      `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (data.status !== "success" || data.data?.status !== "successful") {
      return NextResponse.json({ ok: false, error: "payment not confirmed" }, { status: 400 });
    }

    const tx = data.data;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "not authenticated" }, { status: 401 });
    }

    if (order) {
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          status: "paid",
          total_cfa: tx.amount ?? order.total,
          payment_method: tx.payment_type?.toLowerCase() ?? null,
          payment_ref: tx_ref,
          shipping_name: order.name,
          shipping_phone: order.phone,
          shipping_city: order.city,
          shipping_address: order.address,
        })
        .select("id")
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        return NextResponse.json({ ok: false, error: "order creation failed" }, { status: 500 });
      }

      const { error: itemsError } = await supabase.from("order_items").insert(
        order.items.map((item) => ({
          order_id: newOrder.id,
          variant_id: item.variantId,
          quantity: item.quantity,
          unit_price_cfa: item.price,
        }))
      );

      if (itemsError) {
        console.error("Order items error:", itemsError);
      }

      for (const item of order.items) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", item.variantId)
          .single();

        if (variant) {
          await supabase
            .from("product_variants")
            .update({ stock: Math.max(0, variant.stock - item.quantity) })
            .eq("id", item.variantId);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ ok: false, error: "verify failed" }, { status: 500 });
  }
}
