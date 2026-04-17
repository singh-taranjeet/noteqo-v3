import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import { DOCUMENTS_QUERY_KEY } from './useDocuments';

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title?: string) => documentService.createDocument(title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}
