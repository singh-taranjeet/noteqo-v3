"use client";

import React, { useEffect } from "react";

export function AxeCore() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      typeof window !== "undefined"
    ) {
      import("react-dom").then((ReactDOM) => {
        import("@axe-core/react").then((axe) => {
          axe.default(React, ReactDOM, 1000);
        });
      });
    }
  }, []);

  return null;
}
