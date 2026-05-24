import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AdminPagination } from "@/components/AdminPagination";

const PAGE_SIZE = 20;

export default async function AdminProductsPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Produits</h1>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" role="table">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-3 pr-4 font-medium">Nom</th>
            <th className="pb-3 pr-4 font-medium">Catégorie</th>
            <th className="pb-3 pr-4 font-medium">Prix</th>
            <th className="pb-3 font-medium">Actif</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-3 pr-4">{p.name}</td>
              <td className="py-3 pr-4 text-text-muted">{p.category?.name}</td>
              <td className="py-3 pr-4">{p.base_price.toLocaleString()} FCFA</td>
              <td className="py-3">{p.is_active ? "✓" : "✗"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <AdminPagination currentPage={page} totalPages={totalPages} basePath="/admin/products" />
    </div>
  );
}
