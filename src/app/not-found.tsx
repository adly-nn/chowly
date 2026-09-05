import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-xl border border-black/5 bg-chow-surface p-8 text-center">
      <p className="font-semibold text-chow-ink">We couldn&apos;t find that</p>
      <p className="mt-1 text-sm text-chow-muted">
        This order or page doesn&apos;t exist — it may have been mistyped, or the order code belongs to a
        different session.
      </p>
      <Link href="/menu" className="mt-4 inline-block rounded-lg bg-chow-yellow px-4 py-2 text-sm font-semibold text-chow-ink">
        Back to the menu
      </Link>
    </div>
  );
}
