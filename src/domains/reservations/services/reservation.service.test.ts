import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationService } from './reservation.service';
import { getTenantDb } from '@/db';

vi.mock('@/db', () => {
  const mockTx = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    for: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
  };

  const mockDb = {
    transaction: vi.fn(async (cb) => {
      // Mock the transaction callback
      return cb(mockTx as any);
    }),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };

  return {
    getTenantDb: vi.fn(() => mockDb),
    db: mockDb,
  };
});

vi.mock('@/lib/enterprise/audit', () => ({
  logAudit: vi.fn(),
}));

describe('ReservationService', () => {
  const mockOrgId = 'org-123';
  const mockUserId = 'user-456';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error if the unit is not available during creation', async () => {
    const data = {
      unitId: 'unit-1',
      contactId: 'contact-1',
      expirationDate: '2026-10-10',
    };

    const mockDbObj = getTenantDb(mockOrgId);
    let mockTx: any;
    
    vi.mocked(mockDbObj.transaction).mockImplementationOnce(async (cb) => {
      mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([{ status: 'reserved' }]) // Unit is already reserved
      };
      return cb(mockTx as any);
    });

    await expect(ReservationService.createReservation(mockOrgId, data, mockUserId))
      .rejects
      .toThrow('Unit is not available, current status is: reserved');
  });

  it('should successfully create a reservation and lock the unit if available', async () => {
    const data = {
      unitId: 'unit-for-update',
      contactId: 'contact-1',
      expirationDate: '2026-10-10',
    };

    const mockDbObj = getTenantDb(mockOrgId);
    
    vi.mocked(mockDbObj.transaction).mockImplementationOnce(async (cb) => {
      const mockTx = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        for: vi.fn().mockResolvedValue([{ id: 'unit-for-update', status: 'available' }]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 'res-123', status: 'active' }]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };
      return cb(mockTx as any);
    });

    const result = await ReservationService.createReservation(mockOrgId, data, mockUserId);
    expect(result).toHaveProperty('id', 'res-123');
    expect(result).toHaveProperty('status', 'active');
  });
});
