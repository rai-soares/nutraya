import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RoleEntryScreen } from "@/modules/auth/components/role-entry-screen";
import { AUTH_ROLE_COOKIE_KEY, getRoleHomePath } from "@/modules/auth/auth-storage";
import type { UserRole } from "@/modules/shared/types/api";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get(AUTH_ROLE_COOKIE_KEY)?.value as UserRole | undefined;

  if (role === "NUTRI" || role === "PATIENT") {
    redirect(getRoleHomePath(role));
  }

  return <RoleEntryScreen />;
}
