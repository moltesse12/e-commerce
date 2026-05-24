import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "./status-badge";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Commandes</h1>
      <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 pr-4 font-medium">Client</th>
            <th className="pb-3 pr-4 font-medium">Total</th>
            <th className="pb-3 pr-4 font-medium">Statut</th>
            <th className="pb-3 pr-4 font-medium">Paiement</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((o) => (
            <tr key={o.id} className="border-b border-border">
              <td className="py-3 pr-4">{o.shipping_name}</td>
              <td className="py-3 pr-4">{o.total_cfa.toLocaleString()} FCFA</td>
              <td className="py-3 pr-4"><OrderStatusBadge status={o.status} /></td>
              <td className="py-3 pr-4 text-xs text-text-muted">{o.payment_method ?? "—"}</td>
              <td className="py-3 text-xs text-text-muted">
                {new Date(o.created_at).toLocaleDateString("fr-FR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
