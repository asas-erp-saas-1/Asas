export const CRMEvents = {
  LEAD_REGISTERED: 'CRM.LeadRegistered',
  LEAD_ASSIGNED: 'CRM.LeadAssigned',
  DEAL_INITIATED: 'CRM.DealInitiated',
  DEAL_VSP_CONTRACT_GENERATED: 'CRM.DealVSPContractGenerated',
  DEAL_WON: 'CRM.DealWon',
  DEAL_LOST: 'CRM.DealLost',
};

export interface LeadRegisteredPayload {
  agencyId: string;
  leadId: string;
  firstName: string;
  lastName: string;
  phone: string;
  source: string;
}

export interface DealInitiatedPayload {
  agencyId: string;
  dealId: string;
  leadId: string;
  propertyId: string;
  initialValue: number;
}
