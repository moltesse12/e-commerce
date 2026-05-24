import { ProductGridSkeleton } from "@/components/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
