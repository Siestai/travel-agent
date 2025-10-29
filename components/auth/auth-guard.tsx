"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex h-dvh w-screen items-center justify-center bg-background">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}

