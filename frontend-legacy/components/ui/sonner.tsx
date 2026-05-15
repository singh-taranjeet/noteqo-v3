"use client";
import { CircleAlert, CircleCheck, CircleX, Info, Loader2 } from "lucide-react";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      // eslint-disable-next-line tailwindcss/no-custom-classname -- `toaster` is a sonner library hook class, not a custom class
      className="toaster group"
      icons={{
        success: <CircleCheck strokeWidth={2} className="size-4" />,
        info: <Info strokeWidth={2} className="size-4" />,
        warning: <CircleAlert strokeWidth={2} className="size-4" />,
        error: <CircleX strokeWidth={2} className="size-4" />,
        loading: (
          <Loader2
            strokeWidth={2}
            className="animate-spin size-4 animate-spin"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
