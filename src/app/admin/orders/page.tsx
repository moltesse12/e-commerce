import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "./status-badge";
import { AdminPagination } from "@/components/AdminPagination";

const PAGE_SIZE = 20;

export default async function AdminOrdersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

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
      <AdminPagination currentPage={page} totalPages={totalPages} basePath="/admin/orders" />
    </div>
  );
}
