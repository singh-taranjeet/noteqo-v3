import { AppShell, Sidebar, Header } from "@/components/layout";
import { SecondarySidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/features/auth";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <AppShell>
        <div className="flex h-full shrink-0">
          <Sidebar />
          <SecondarySidebar />
        </div>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
