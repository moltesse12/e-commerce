"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  processing: "bg-info/20 text-info",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-gray-100 text-gray-800",
  returned: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_FLOW = ["pending", "paid", "processing", "shipped", "delivered"];

export function OrderStatusBadge({ status }: { status: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function advanceStatus() {
    const idx = STATUS_FLOW.indexOf(status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    const { error } = await supabase
      .from("orders")
      .update({ status: next })
      .eq("status", status);
    if (!error) router.refresh();
  }

  return (
    <button
      onClick={advanceStatus}
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100"}`}
      title={`Passer de "${status}" au statut suivant`}
      aria-label={`Statut actuel : ${status}. Cliquer pour avancer`}
    >
      {status}
    </button>
  );
}
