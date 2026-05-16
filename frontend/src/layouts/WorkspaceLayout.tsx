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
            <SidebarInset>
              <Header />
              <main className="flex-1 overflow-auto">
                <Outlet />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </AppShell>
      </RealtimeProvider>
    </AuthGuard>
  );
}
