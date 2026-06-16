export const FinanceEvents = {
  PAYMENT_SCHEDULE_CREATED: 'Finance.PaymentScheduleCreated',
  PAYMENT_RECEIVED: 'Finance.PaymentReceived',
  PAYMENT_LATE: 'Finance.PaymentLate',
  DISCOUNT_REQUESTED: 'Finance.DiscountRequested',
  DISCOUNT_APPROVED: 'Finance.DiscountApproved',
};

export interface PaymentScheduleCreatedPayload {
  agencyId: string;
  dealId: string;
  scheduleId: string;
  totalAmount: number;
  installmentsCount: number;
}
