import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <p
          className="serif text-8xl font-bold mb-4"
          style={{ color: "var(--accent)" }}
        >
          404
        </p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-[var(--muted)] mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn">
          Back to home →
        </Link>
      </div>
    </main>
  );
}
