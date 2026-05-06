import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function RootError() {
  const error = useRouteError();

  let message = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    message = error.statusText || error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
