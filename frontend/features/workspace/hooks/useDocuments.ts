import { useQuery } from '@tanstack/react-query';
import { documentService } from '../services/document.service';

export const DOCUMENTS_QUERY_KEY = ['documents'] as const;

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: () => documentService.getAllDocuments(),
  });
}
