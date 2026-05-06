/**
 * Base Entity representing the standard properties injected by the backend
 * `AppBaseEntity`. Ensures consistency across all domains.
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
}
