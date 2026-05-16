import { createBrowserRouter } from "react-router-dom";

// Layouts
import { RootLayout } from "./layouts/RootLayout";
import { RootError } from "./layouts/RootError";
import { AuthLayout } from "./layouts/AuthLayout";

// Pages — all eagerly loaded for offline-first
import { PublicLandingView } from "./features/landing";
import { LoginForm, RegisterForm } from "./features/auth";
import { DashboardView, LibraryView, TrashView } from "./features/workspace";
import { AssetsView } from "./features/media/components/AssetsView";
import { SpaceHomeView } from "./features/spaces";
import { OfflineView } from "./features/pwa";

// Note page wrapper (extracts noteId from URL params)
import { NotePageWrapper } from "./layouts/NotePageWrapper";
import { WorkSpaceLayout } from "./layouts/WorkSpaceLayout";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { path: "/", element: <PublicLandingView /> },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginForm /> },
          { path: "/register", element: <RegisterForm /> },
        ],
      },
      {
        element: <WorkSpaceLayout.Wrapper />,
        children: [
          { path: "/notes", element: <DashboardView /> },
          { path: "/notes/:note_id", element: <NotePageWrapper /> },
          { path: "/spaces/:space_id", element: <SpaceHomeView /> },
          { path: "/library", element: <LibraryView /> },
          { path: "/trash", element: <TrashView /> },
          { path: "/assets", element: <AssetsView /> },
        ],
      },
      { path: "/offline", element: <OfflineView /> },
    ],
  },
]);
