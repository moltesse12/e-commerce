"use client";

import { Suspense } from "react";
import { CheckoutSuccessInner } from "./inner";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Vérification du paiement...</div>}>
      <CheckoutSuccessInner />
    </Suspense>
  );
}
