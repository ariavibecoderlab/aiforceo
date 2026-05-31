"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="text-center max-w-md">
        <p
          className="serif text-8xl font-bold mb-4"
          style={{ color: "var(--red)" }}
        >
          500
        </p>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-[var(--muted)] mb-8">
          An unexpected error occurred. Try again or go back home.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
