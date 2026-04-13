import { ClsServiceManager } from 'nestjs-cls';

/**
 * Safely extracts the current authenticated user ID dynamically from the 
 * Async Local Storage global HTTP container. Returns null if executed 
 * dynamically without an active request context natively.
 */
export function getCurrentUserId(): string | null {
  const cls = ClsServiceManager.getClsService();
  return cls.isActive() ? cls.get('user')?.id : null;
}
