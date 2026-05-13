import * as React from "react";

export function AxeCore() {
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      import("@axe-core/react").then((axe) => {
        import("react-dom").then((ReactDOM) => {
          axe.default(React, ReactDOM, 1000);
        });
      });
    }
  }, []);
  return null;
}
