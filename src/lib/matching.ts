export interface UserMeasures {
  height_cm: number | null;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  inseam_cm: number | null;
}

export interface VariantMeasures {
  id: string;
  size_label: string;
  chest_cm: number | null;
  length_cm: number | null;
  shoulder_cm: number | null;
  waist_cm: number | null;
  sleeve_cm: number | null;
  neck_cm: number | null;
  weight_min_kg: number | null;
  weight_max_kg: number | null;
}

export interface MatchResult {
  variantId: string;
  sizeLabel: string;
  distance: number;
  confidence: "high" | "medium" | "low";
}

type Category = "t-shirts" | "chemises" | "pantalons" | "chaussures" | string;

function getWeights(category: Category): Record<string, number> {
  switch (category) {
    case "t-shirts":
    case "chemises":
      return { chest_cm: 0.35, waist_cm: 0.25, shoulder_cm: 0.2, length_cm: 0.1, sleeve_cm: 0.1 };
    case "pantalons":
      return { waist_cm: 0.4, inseam: 0.3, hips_cm: 0.2, length_cm: 0.1 };
    case "chaussures":
      return {};
    default:
      return { chest_cm: 0.3, waist_cm: 0.2, length_cm: 0.2, shoulder_cm: 0.15, sleeve_cm: 0.15 };
  }
}

function estimateFromHeightWeight(
  heightCm: number,
  weightKg: number
): { chest_cm: number; waist_cm: number; hips_cm: number; inseam_cm: number } {
  return {
    chest_cm: heightCm * 0.53 + weightKg * 0.15,
    waist_cm: heightCm * 0.45 + weightKg * 0.2,
    hips_cm: heightCm * 0.52 + weightKg * 0.1,
    inseam_cm: heightCm * 0.46,
  };
}

export function findBestSize(
  user: UserMeasures,
  variants: VariantMeasures[],
  category: Category
): MatchResult | null {
  if (variants.length === 0) return null;

  const hasAllMeasures = user.chest_cm && user.waist_cm && user.hips_cm && user.inseam_cm;
  const hasHeightWeight = user.height_cm && user.weight_kg;

  let usedMeasures: UserMeasures;

  if (hasAllMeasures) {
    usedMeasures = user;
  } else if (hasHeightWeight) {
    const estimated = estimateFromHeightWeight(user.height_cm!, user.weight_kg!);
    usedMeasures = {
      ...user,
      chest_cm: estimated.chest_cm,
      waist_cm: estimated.waist_cm,
      hips_cm: estimated.hips_cm,
      inseam_cm: estimated.inseam_cm,
    };
  } else {
    return null;
  }

  if (category === "chaussures") {
    const footSize = user.height_cm ? Math.round(user.height_cm * 0.15 + 34) : null;
    if (!footSize) return null;
    return {
      variantId: variants[0].id,
      sizeLabel: String(footSize),
      distance: 0,
      confidence: "low",
    };
  }

  const weights = getWeights(category);
  const isEstimated = !hasAllMeasures;

  let best: { variant: VariantMeasures; distance: number } | null = null;

  for (const v of variants) {
    let distSq = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const userVal = usedMeasures[key as keyof UserMeasures] as number | null;
      const variantVal = v[key as keyof VariantMeasures] as number | null;
      if (userVal && variantVal) {
        distSq += weight * ((userVal - variantVal) / 10) ** 2;
        totalWeight += weight;
      }
    }

    if (totalWeight === 0) continue;

    const distance = Math.sqrt(distSq / totalWeight);

    if (!best || distance < best.distance) {
      best = { variant: v, distance };
    }
  }

  if (!best) return null;

  let confidence: MatchResult["confidence"];
  if (isEstimated) {
    confidence = best.distance < 1.5 ? "medium" : "low";
  } else {
    confidence = best.distance < 1.0 ? "high" : best.distance < 2.0 ? "medium" : "low";
  }

  return {
    variantId: best.variant.id,
    sizeLabel: best.variant.size_label,
    distance: Math.round(best.distance * 100) / 100,
    confidence,
  };
}
