import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { order_item_id, product_id, rating, fit_rating, size_purchased, comment } =
    await request.json();

  const { data: measurements } = await supabase
    .from("user_measurements")
    .select("height_cm, weight_kg")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    order_item_id,
    user_id: user.id,
    product_id,
    rating,
    fit_rating,
    size_purchased,
    reviewer_height_cm: measurements?.height_cm ?? null,
    reviewer_weight_kg: measurements?.weight_kg ?? null,
    comment,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
