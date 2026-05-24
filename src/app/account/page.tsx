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

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Mon compte</h1>
        <form action="/account/logout" method="post">
          <button className="text-sm text-gray-500 underline">D&eacute;connexion</button>
        </form>
      </div>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-primary">Profil</h2>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p><span className="font-medium">Nom :</span> {profile?.full_name ?? "—"}</p>
          <p><span className="font-medium">Email :</span> {user.email}</p>
          <p><span className="font-medium">Pays :</span> {profile?.country?.toUpperCase() ?? "SN"}</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-primary">Mesures morphologiques</h2>
        {measurements ? (
          <div className="mt-4 space-y-2 text-sm text-gray-600">
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
    </div>
  );
}
