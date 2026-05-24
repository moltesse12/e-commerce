import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MeasurementForm } from "@/components/MeasurementForm";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: measurements } = await supabase
    .from("user_measurements")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Mon compte</h1>
        <form action="/account/logout" method="post">
          <button className="text-sm text-text-muted underline">D&eacute;connexion</button>
        </form>
      </div>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-primary">Profil</h2>
        <div className="mt-4 space-y-2 text-sm text-text">
          <p><span className="font-medium">Nom :</span> {profile?.full_name ?? "—"}</p>
          <p><span className="font-medium">Email :</span> {user.email}</p>
          <p><span className="font-medium">Pays :</span> {profile?.country?.toUpperCase() ?? "SN"}</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-primary">Mesures morphologiques</h2>
        {measurements ? (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-text">
            <p>Taille : {measurements.height_cm} cm</p>
            <p>Poids : {measurements.weight_kg} kg</p>
            <p>Tour poitrine : {measurements.chest_cm} cm</p>
            <p>Tour taille : {measurements.waist_cm} cm</p>
            <p>Tour hanches : {measurements.hips_cm} cm</p>
            <p>Entrejambe : {measurements.inseam_cm} cm</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            Vous n&rsquo;avez pas encore renseign&eacute; vos mesures.
          </p>
        )}
        <div className="mt-4">
          <MeasurementForm existing={measurements} />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-primary">Mes commandes</h2>
        {orders && orders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-primary">
                    {o.total_cfa.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(o.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  o.status === "paid" || o.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : o.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-text-muted">Aucune commande pour le moment.</p>
        )}
      </section>

      {profile?.is_admin && (
        <a
          href="/admin"
          className="block rounded-lg bg-primary px-6 py-3 text-center text-sm font-semibold text-white"
        >
          Acc&egrave;s administration
        </a>
      )}
    </div>
  );
}
