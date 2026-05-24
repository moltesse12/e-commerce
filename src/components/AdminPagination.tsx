import Link from "next/link";

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function AdminPagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="rounded border border-border px-3 py-1.5 text-sm text-text hover:bg-surface"
        >
          Précédent
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={`${basePath}?page=${p}`}
          className={`rounded px-3 py-1.5 text-sm ${
            p === currentPage
              ? "bg-accent text-white"
              : "border border-border text-text hover:bg-surface"
          }`}
        >
          {p}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="rounded border border-border px-3 py-1.5 text-sm text-text hover:bg-surface"
        >
          Suivant
        </Link>
      )}
    </nav>
  );
}
