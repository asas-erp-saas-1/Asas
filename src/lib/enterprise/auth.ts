import { headers } from "next/headers";
import { RBACContext } from "./rbac";
import { createClient } from "@/lib/supabase/server";

export interface SessionContext extends RBACContext {
  organizationId: string;
}

export async function getSession(): Promise<SessionContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    // Attempt to get user properties from auth metadata or profile
    // Note: since the legacy system mixes agency_id and organization_id, we align with the new schema (organization_id)
    // but fallback to checking the user's profile if metadata isn't sufficient.
    const { data: userRecord } = await supabase
      .from("users")
      .select("organization_id, roles(name, role_permissions(permission_context, action))")
      .eq("id", session.user.id)
      .single();

    // Fallback to legacy profiles if new users table isn't populated
    let orgId = userRecord?.organization_id;
    let role = (Array.isArray(userRecord?.roles) ? userRecord?.roles[0]?.name : (userRecord?.roles as any)?.name) || "user";

    if (!orgId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("agency_id, role")
        .eq("id", session.user.id)
        .single();

      orgId = profile?.agency_id;
      role = profile?.role || "user";
    }

    if (!orgId) {
      return null;
    }

    // Gather concrete permissions based on roles
    let permissions = ["crm:read"]; // Safe restrictive default (fail-closed)
    if (userRecord?.roles) {
      try {
         const roleArr = Array.isArray(userRecord.roles) ? userRecord.roles : [userRecord.roles];
         const roleData = roleArr[0] as any;
         const roleName = roleData?.name?.toLowerCase();
         
         const dbPerms = roleData?.role_permissions || [];
         if (Array.isArray(dbPerms) && dbPerms.length > 0) {
           permissions = dbPerms.map((p: any) => `${p.permission_context}:${p.action}`);
         } else {
           if (roleName === 'admin' || roleName === 'super_admin') {
             permissions = ["*:*"];
           } else {
             // We would fetch permissions from rolePermissions here, but since rolePermissions might not be populated,
             // we assign a base set based on role string.
             if (roleName === 'agent') {
               permissions = [
                 "deals:read", "deals:write", "properties:read", "clients:read", "clients:write", "reservations:read", "reservations:write", "crm:read", "crm:write"
               ];
             } else if (roleName === 'manager') {
                permissions = ["deals:read", "deals:write", "deals:delete", "properties:read", "properties:write", "clients:read", "clients:write", "reservations:read", "reservations:write", "crm:read", "crm:write", "finance:read"];
             } else {
                permissions = ["crm:read"];
             }
           }
         }
      } catch(e) {}
    } else {
       // Legacy fallback
       const roleName = role.toLowerCase();
       if (roleName === 'admin' || roleName === 'super_admin') {
          permissions = ["*:*"];
       } else if (roleName === 'agent') {
          permissions = ["deals:read", "deals:write", "properties:read", "clients:read", "clients:write", "reservations:read", "reservations:write", "crm:read", "crm:write"];
       } else if (roleName === 'manager') {
          permissions = ["deals:read", "deals:write", "deals:delete", "properties:read", "properties:write", "clients:read", "clients:write", "reservations:read", "reservations:write", "crm:read", "crm:write", "finance:read"];
       } else {
          permissions = ["crm:read"];
       }
    }

    return {
      userId: session.user.id,
      organizationId: orgId,
      role: role,
      permissions: permissions,
    };
  } catch (error) {
    return null;
  }
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
