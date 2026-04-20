export interface ApiSuccessResponse<T> {
  success: true;
  data: T | null;
  meta: ApiPaginationMeta | null;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details: ApiFieldError[] | null;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiPaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
