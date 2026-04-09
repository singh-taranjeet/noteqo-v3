"use client";

import dynamic from "next/dynamic";
import { NoteEditorSkeleton } from "./components/NoteEditorSkeleton";

/**
 * Lazily loaded NoteEditor — the Tiptap bundle is heavy (~200KB+) and
 * requires browser-only APIs (Web Crypto, IndexedDB), so we split it out
 * and show a content-shaped skeleton while it loads.
 */
export const NoteEditor = dynamic(
  () => import("./components/NoteEditor").then((mod) => mod.NoteEditor),
  {
    ssr: false,
    loading: () => <NoteEditorSkeleton />,
  },
);
