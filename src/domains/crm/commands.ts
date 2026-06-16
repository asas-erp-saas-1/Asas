import { Command } from '@/lib/kernel/core';

export interface RegisterLeadCommand extends Command<{
  agencyId: string;
  firstName: string;
  lastName: string;
  phone: string;
  source: string;
}> {
  type: 'CRM.RegisterLead';
}

export interface InitiateDealCommand extends Command<{
  agencyId: string;
  leadId: string;
  propertyId: string;
  initialValue: number;
}> {
  type: 'CRM.InitiateDeal';
}
