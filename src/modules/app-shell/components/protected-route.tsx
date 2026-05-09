"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth/auth-context";
import { getRoleHomePath } from "@/modules/auth/auth-storage";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import type { UserRole } from "@/modules/shared/types/api";

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, status } = useAuth();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowedRoles.includes(session.user.role)) {
      router.replace(getRoleHomePath(session.user.role));
    }
  }, [allowedRoles, pathname, router, session, status]);

  if (status === "loading") {
    return <LoadingState message="Verificando sua sessão..." />;
  }

  if (!session || !allowedRoles.includes(session.user.role)) {
    return <LoadingState message="Redirecionando..." />;
  }

  return <>{children}</>;
}
