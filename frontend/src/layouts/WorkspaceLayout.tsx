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
            <SidebarInset className="shadow-none! rounded-xl! p-0! bg-transparent! border-none! m-0!">
              <div className="right-2 top-2 shadow-xl absolute flex h-[calc(100vh-8px)] w-full flex-col overflow-hidden border-none rounded-xl bg-transparent">
                <Header />
                <div className="flex-1 overflow-auto rounded-xl">
                  <div className="pt-11 rounded-xl">
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
