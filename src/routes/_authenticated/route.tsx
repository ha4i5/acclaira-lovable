import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isAdmin } from "@/lib/admin.functions";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const checkAdmin = useServerFn(isAdmin);
  const adminQ = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-muted-foreground">
        Loading your newsroom…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/">
            <Logo size={28} />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/dashboard" activeProps={{ className: "text-primary" }} className="hover:text-primary">Dashboard</Link>
            <Link to="/studio" activeProps={{ className: "text-primary" }} className="hover:text-primary">Studio</Link>
            <Link to="/credits" activeProps={{ className: "text-primary" }} className="hover:text-primary">Credits</Link>
            <Link to="/api-keys" activeProps={{ className: "text-primary" }} className="hover:text-primary">API keys</Link>
          </nav>
          <div className="flex items-center gap-3">
            {adminQ.data?.isAdmin ? (
              <Link to="/admin" className="text-sm font-medium hover:underline">
                Admin
              </Link>
            ) : null}
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/" });
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
