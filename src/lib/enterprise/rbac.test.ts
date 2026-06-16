import { describe, it, expect, vi } from 'vitest';
import { requirePermission } from './rbac';

describe('RBAC System', () => {
  it('should allow access if user has global wildcard permission', () => {
    const session = { userId: '1', organizationId: 'org-1', role: 'admin', permissions: ['*:*'] };
    expect(() => requirePermission(session, 'deals', 'read')).not.toThrow();
  });

  it('should allow access if user has specific permission', () => {
    const session = { userId: '1', organizationId: 'org-1', role: 'user', permissions: ['deals:read'] };
    expect(() => requirePermission(session, 'deals', 'read')).not.toThrow();
  });

  it('should throw an error if user lacks permission', () => {
    const session = { userId: '1', organizationId: 'org-1', role: 'user', permissions: ['deals:read'] };
    // Try to write
    expect(() => requirePermission(session, 'deals', 'write')).toThrow();
  });
});
