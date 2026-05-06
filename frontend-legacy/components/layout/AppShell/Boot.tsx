"use client";
import { useAllMediaList } from "@/features/media";
import { useSpaces } from "@/features/spaces";
import { useRemoteSpaces } from "@/features/spaces/hooks/useRemoteSpace";
import { useSyncQueue } from "@/hooks";

export function Boot(props: { children: React.ReactNode }) {
  useSyncQueue();

  const { data } = useSpaces();

  useRemoteSpaces();

  const { spaces = [] } = data || {};

  useAllMediaList(spaces.map((s) => s.id));

  return <>{props.children}</>;
}
