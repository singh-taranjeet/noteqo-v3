import { Outlet } from "react-router-dom";
import { Providers } from "@/components/Providers";
import { AxeCore } from "@/components/AxeCore";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function RootLayout() {
  return (
    <Providers>
      <AxeCore />
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
      <Toaster />
    </Providers>
  );
}
