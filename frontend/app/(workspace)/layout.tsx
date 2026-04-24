import { AppShell, AppSidebar, Header } from "@/components/layout";
import { SecondarySidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/features/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>
        <SidebarProvider>
          <AppSidebar />
          <SecondarySidebar />
          <SidebarInset>
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </AppShell>
    </AuthGuard>
  );
}
