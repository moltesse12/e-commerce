import { Skeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <div className="grid gap-12 md:grid-cols-2">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-3/4" />
          <Skeleton className="mt-2 h-8 w-1/3" />
        </div>
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
