import { useRemoteNotes } from "./useRemoteNotes";

export const useMergeLocalRemote = () => {
  const { data, isLoading } = useRemoteNotes();

  console.log("notes", data, isLoading);
};
