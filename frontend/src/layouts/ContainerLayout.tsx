import { Outlet } from "react-router-dom";
import { AppShell, AppSidebar, Header } from "@/components/core";
import { AuthGuard } from "@/features/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { RealtimeProvider } from "@/features/realtime";

export const ContainerLayout = {
  Heading: (props: { title: string; subTitle: string; Icon: any }) => {
    const { title, subTitle, Icon } = props;
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Icon size={32} className="text-primary" />
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{subTitle}</p>
        </div>
      </div>
    );
  },
  Wrapper: () => {
    return (
      <AuthGuard>
        <RealtimeProvider>
          <AppShell>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="shadow-none! rounded-xl! p-0! bg-transparent! border-none! m-0!">
                <div className="absolute left-2 top-2 shadow-xl flex h-[calc(100vh-16px)] w-[calc(100%-16px)] flex-col overflow-hidden border border-transparent dark:border-white/10 rounded-xl bg-transparent">
                  <Header />
                  <div className="flex-1 overflow-auto rounded-xl bg-background">
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
  },
  Spacer: (props: { children: React.ReactNode }) => {
    return (
      <section className="px-5 pt-10 bg-background max-w-6xl mx-auto">
        {props.children}
      </section>
    );
  },
};
