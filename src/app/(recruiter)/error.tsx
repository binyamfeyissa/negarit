"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RecruiterError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center p-8">
      <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
      <p className="text-sm text-slate-500 max-w-sm">{error.message || "An unexpected error occurred. Please try again."}</p>
      <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-700 text-white">
        Try again
      </Button>
    </div>
  );
}
