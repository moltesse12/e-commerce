import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: productsCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { data: revenue } = await supabase
    .from("orders")
    .select("total_cfa")
    .eq("status", "paid");

  const totalRevenue = revenue?.reduce((s, r) => s + r.total_cfa, 0) ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Administration</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-gray-500">Commandes</p>
          <p className="text-3xl font-bold text-primary">{ordersCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-gray-500">Produits actifs</p>
          <p className="text-3xl font-bold text-primary">{productsCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-6">
          <p className="text-sm text-gray-500">Revenu total</p>
          <p className="text-3xl font-bold text-accent">
            {totalRevenue.toLocaleString()} FCFA
          </p>
        </div>
      </div>

      <nav className="flex gap-4">
        <Link
          href="/admin/orders"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Gérer les commandes
        </Link>
        <Link
          href="/admin/products"
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-primary"
        >
          Gérer les produits
        </Link>
      </nav>
    </div>
  );
}
