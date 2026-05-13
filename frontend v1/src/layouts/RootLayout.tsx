import { Outlet } from "react-router-dom";
import { Providers } from "@/components/Providers";
import { AxeCore } from "@/components/AxeCore";
import { TooltipProvider } from "@/components/ui/tooltip";

export function RootLayout() {
  return (
    <Providers>
      <AxeCore />
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </Providers>
  );
}
