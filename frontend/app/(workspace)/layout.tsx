import { AppShell, Sidebar, Header } from "@/components/layout";
import { SecondarySidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/features/auth";

import { SidebarContainer } from "@/components/layout/Sidebar/SidebarContainer";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>
        <SidebarContainer>
          <Sidebar />
          <SecondarySidebar />
        </SidebarContainer>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
