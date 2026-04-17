import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "../services/document.service";
import { DOCUMENTS_QUERY_KEY } from "./useDocuments";
import { useRouter } from "next/navigation";

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (title?: string) => documentService.createDocument(title),
    onSuccess: (document) => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      router.push(`/notes/${document.id}`);
    },
  });
}
