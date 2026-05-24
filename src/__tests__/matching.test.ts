import { describe, it, expect } from "vitest";
import { findBestSize } from "@/lib/matching";

const tShirtVariants = [
  { id: "s", size_label: "S", chest_cm: 88, length_cm: 68, shoulder_cm: 42, waist_cm: 76, sleeve_cm: 20, neck_cm: 37, weight_min_kg: 55, weight_max_kg: 65 },
  { id: "m", size_label: "M", chest_cm: 96, length_cm: 70, shoulder_cm: 44, waist_cm: 82, sleeve_cm: 21, neck_cm: 39, weight_min_kg: 65, weight_max_kg: 75 },
  { id: "l", size_label: "L", chest_cm: 104, length_cm: 72, shoulder_cm: 46, waist_cm: 88, sleeve_cm: 22, neck_cm: 41, weight_min_kg: 75, weight_max_kg: 85 },
  { id: "xl", size_label: "XL", chest_cm: 112, length_cm: 74, shoulder_cm: 48, waist_cm: 94, sleeve_cm: 23, neck_cm: 43, weight_min_kg: 85, weight_max_kg: 95 },
];

describe("findBestSize", () => {
  it("returns null when no variants", () => {
    const result = findBestSize(
      { height_cm: 175, weight_kg: 70, chest_cm: 95, waist_cm: 80, hips_cm: 95, inseam_cm: 80 },
      [],
      "t-shirts"
    );
    expect(result).toBeNull();
  });

  it("returns null when no user measures at all", () => {
    const result = findBestSize(
      { height_cm: null, weight_kg: null, chest_cm: null, waist_cm: null, hips_cm: null, inseam_cm: null },
      tShirtVariants,
      "t-shirts"
    );
    expect(result).toBeNull();
  });

  it("matches correct size for M measurements", () => {
    const result = findBestSize(
      { height_cm: 175, weight_kg: 70, chest_cm: 95, waist_cm: 82, hips_cm: 95, inseam_cm: 80 },
      tShirtVariants,
      "t-shirts"
    );
    expect(result?.sizeLabel).toBe("M");
    expect(result?.confidence).toBe("high");
  });

  it("matches correct size for L measurements", () => {
    const result = findBestSize(
      { height_cm: 185, weight_kg: 82, chest_cm: 106, waist_cm: 88, hips_cm: 100, inseam_cm: 85 },
      tShirtVariants,
      "t-shirts"
    );
    expect(result?.sizeLabel).toBe("L");
  });

  it("uses height+weight estimation when no detailed measures", () => {
    const result = findBestSize(
      { height_cm: 185, weight_kg: 82, chest_cm: null, waist_cm: null, hips_cm: null, inseam_cm: null },
      tShirtVariants,
      "t-shirts"
    );
    expect(result).not.toBeNull();
    expect(["S", "M", "L", "XL"]).toContain(result!.sizeLabel);
  });

  it("returns medium or low confidence with estimation fallback", () => {
    const result = findBestSize(
      { height_cm: 175, weight_kg: 180, chest_cm: null, waist_cm: null, hips_cm: null, inseam_cm: null },
      tShirtVariants,
      "t-shirts"
    );
    expect(["medium", "low"]).toContain(result?.confidence);
  });

  it("handles shoes category with formula", () => {
    const shoeVariants = [
      { id: "v1", size_label: "42", chest_cm: null, length_cm: null, shoulder_cm: null, waist_cm: null, sleeve_cm: null, neck_cm: null, weight_min_kg: null, weight_max_kg: null },
    ];
    const result = findBestSize(
      { height_cm: 180, weight_kg: 75, chest_cm: null, waist_cm: null, hips_cm: null, inseam_cm: null },
      shoeVariants,
      "chaussures"
    );
    expect(result).not.toBeNull();
  });

  it("prefers detailed measures over estimation", () => {
    const detailed = findBestSize(
      { height_cm: 175, weight_kg: 70, chest_cm: 95, waist_cm: 82, hips_cm: 95, inseam_cm: 80 },
      tShirtVariants,
      "t-shirts"
    );
    const estimated = findBestSize(
      { height_cm: 175, weight_kg: 70, chest_cm: null, waist_cm: null, hips_cm: null, inseam_cm: null },
      tShirtVariants,
      "t-shirts"
    );
    expect(detailed?.confidence).toBe("high");
    expect(estimated?.confidence).not.toBe("high");
  });
});
