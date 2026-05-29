import { useEffect, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/about",
  "/privacy",
  "/terms",
];

// Routes that logged-in users should NOT be able to visit
// (e.g. they're already logged in, no need to see login/signup again)
const AUTH_ONLY_ROUTES = ["/login", "/signup"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [ready, setReady] = useState(false);

  const currentPath = routerState.location.pathname;
  const isPublic = PUBLIC_ROUTES.includes(currentPath);
  const isAuthOnly = AUTH_ONLY_ROUTES.includes(currentPath);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token && isAuthOnly) {
      // Logged-in user trying to visit /login or /signup → send to dashboard
      navigate({ to: "/dashboard", replace: true });
      return;
    }

    if (!token && !isPublic) {
      // Unauthenticated user trying to visit a protected route → send to login
      navigate({
        to: "/login",
        search: { callbackUrl: currentPath },
        replace: true,
      });
      return;
    }

    // All other cases (public route, or authenticated user on a protected route)
    setReady(true);
  }, [currentPath, isPublic, isAuthOnly, navigate]);

  // Show a spinner only on protected routes while we verify the token
  if (!ready && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-leaf" />
      </div>
    );
  }

  return <>{children}</>;
}
