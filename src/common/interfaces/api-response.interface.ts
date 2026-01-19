export interface HttpResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
  error?: HttpError | null;
  meta?: PaginationMeta | null;
}

export interface HttpError {
  code?: string;
  message?: string;
  fields?: Record<string, string[]>;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
}
