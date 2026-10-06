import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { TabBar, Toasts } from "@/components/Chrome";
import { hasSeenSplash } from "@/lib/intro";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const TAB_PATHS = ["/home", "/bookings", "/location", "/profile"];

function AppLayout() {
  const { user, guest, onboarded } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!hasSeenSplash()) return;
    if (!onboarded) navigate({ to: "/onboarding" });
    else if (!user && !guest) navigate({ to: "/login" });
  }, [onboarded, user, guest, navigate]);

  const showTabs = TAB_PATHS.includes(pathname);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background text-foreground">
      <div className="flex-1">
        <Outlet />
      </div>
      {showTabs && <TabBar />}
      <Toasts />
    </div>
  );
}
