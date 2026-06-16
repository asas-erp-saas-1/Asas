import { Command } from '@/lib/kernel/core';

export interface CreatePaymentScheduleCommand extends Command<{
  agencyId: string;
  dealId: string;
  totalAmount: number;
  installmentsCount: number;
  startDate: Date;
}> {
  type: 'Finance.CreatePaymentSchedule';
}

export interface RequestDiscountCommand extends Command<{
  agencyId: string;
  dealId: string;
  originalAmount: number;
  requestedDiscount: number;
  justification: string;
}> {
  type: 'Finance.RequestDiscount';
}
