import { supabase } from "@/lib/supabase";
import type { Review } from "@/lib/types";

interface Props {
  productId: string;
}

async function getReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

function getMorphoTag(
  review: Review,
  userHeight: number | null,
  userWeight: number | null
): string | null {
  if (!userHeight || !review.reviewer_height_cm) return null;
  const hDiff = Math.abs(userHeight - review.reviewer_height_cm);
  const wDiff =
    userWeight && review.reviewer_weight_kg
      ? Math.abs(userWeight - review.reviewer_weight_kg)
      : 999;
  if (hDiff <= 5 && wDiff <= 5) return "Morphologie similaire";
  if (hDiff <= 5) return "Taille similaire";
  return null;
}

export async function ReviewSection({ productId }: Props) {
  const reviews = await getReviews(productId);

  if (reviews.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-primary">Avis</h2>
        <p className="mt-2 text-sm text-gray-500">
          Aucun avis pour le moment. Soyez le premier à donner votre avis !
        </p>
      </section>
    );
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-4">
        <h2 className="text-lg font-semibold text-primary">Avis</h2>
        <span className="text-sm text-gray-500">
          {avgRating.toFixed(1)}/5 &bull; {reviews.length} avis
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {reviews.map((r) => {
          const tag = getMorphoTag(r, null, null);
          return (
            <div key={r.id} className="rounded-lg border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </span>
                {tag && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {tag}
                  </span>
                )}
              </div>
              {r.fit_rating && (
                <p className="mt-1 text-xs text-gray-500">
                  Ajustement :{" "}
                  {r.fit_rating === "true"
                    ? "Taille parfaite"
                    : r.fit_rating === "small"
                      ? "Taille trop petite"
                      : "Taille trop grande"}
                </p>
              )}
              {r.comment && (
                <p className="mt-2 text-sm text-gray-600">{r.comment}</p>
              )}
              {r.reviewer_height_cm && (
                <p className="mt-1 text-xs text-gray-400">
                  {r.reviewer_height_cm} cm
                  {r.reviewer_weight_kg && ` / ${r.reviewer_weight_kg} kg`}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
