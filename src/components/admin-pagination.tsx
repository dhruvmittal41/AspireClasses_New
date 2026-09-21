import Link from "next/link";

export const ADMIN_PAGE_SIZE = 20;
export function adminPage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}
export function searchPattern(value: string) {
  return "%" + value.replace(/[\\%_]/g, "\\$&") + "%";
}
export function AdminPagination({ path, page, count, params = {} }: {
  path: string; page: number; count: number; params?: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));
  const link = (next: number) => path + "?" + new URLSearchParams({ ...params, page: String(next) });
  return <nav className="admin-pagination" aria-label="Results pages">
    <span>{count.toLocaleString("en-IN")} records · Page {page} of {pages}</span>
    <div>{page > 1 && <Link className="button secondary small" href={link(page - 1)}>Previous</Link>}
    {page < pages && <Link className="button secondary small" href={link(page + 1)}>Next</Link>}
    {page > pages && <Link className="text-link" href={link(1)}>Back to first page</Link>}</div>
  </nav>;
}
