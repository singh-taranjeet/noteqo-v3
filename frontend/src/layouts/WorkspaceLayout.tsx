import { Outlet } from "react-router-dom";
import { AppShell, AppSidebar, Header } from "@/components/core";
import { AuthGuard } from "@/features/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RealtimeProvider } from "@/features/realtime";

export function WorkspaceLayout() {
  return (
    <AuthGuard>
      <RealtimeProvider>
        <AppShell>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="shadow-none! rounded-none! pt-0! bg-transparent!">
              <div className="shadow-xl absolute left-1 top-1 flex h-[calc(100vh-8px)] w-[calc(100%-8px)] flex-col overflow-hidden rounded-xl border bg-background">
                <Header />
                <div className="flex-1 overflow-auto">
                  <div className="pt-11">
                    <Outlet />
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AppShell>
      </RealtimeProvider>
    </AuthGuard>
  );
}
