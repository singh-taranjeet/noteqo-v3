import { Outlet } from "react-router-dom";
import { AppShell, AppSidebar, Header } from "@/components/layout";
import { AuthGuard } from "@/features/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function WorkspaceLayout() {
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
