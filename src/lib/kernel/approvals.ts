import { AggregateRoot, SystemEvent, SystemEvents, kernel } from './core';
import { inboxEngine } from './inbox';
import { eventBus } from './bus';

export type ApprovalState = 'REQUESTED' | 'APPROVED' | 'REJECTED';
export type StepState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

export interface ApprovalStep {
    order: number;
    requiredRole: string;
    status: StepState;
}

export class ApprovalChainAggregate extends AggregateRoot<{ 
    targetType: string, 
    targetId: string, 
    domain: string,
    status: ApprovalState, 
    steps: ApprovalStep[] 
}> {
    
    approveStep(order: number, userId: string, userRole: string, comments?: string) {
        if (this.state.status !== 'REQUESTED') throw new Error("Chain is closed.");
        
        const step = this.state.steps.find(s => s.order === order);
        if (!step) throw new Error("Step not found");
        if (step.status !== 'PENDING') throw new Error("Step already acted upon");
        
        // CEO Override System
        const isCEO = userRole === 'CEO';
        
        if (step.requiredRole !== userRole && !isCEO) {
            throw new Error(`Unauthorized to approve this step. Required: ${step.requiredRole}`);
        }
        
        this.applyChange({
            id: crypto.randomUUID(),
            eventType: 'ApprovalStepApproved',
            aggregateType: 'ApprovalChain',
            aggregateId: this.id,
            sourceModule: 'Approvals',
            payload: { order, comments, approvedByRole: userRole, isCEOOverride: isCEO },
            createdAt: new Date(),
            createdBy: userId
        });

        // Determine if chain is fully approved
        // If CEO approved, any remaining steps are skipped/approved by override.
        let allApproved = false;
        if (isCEO) {
             allApproved = true; // CEO override approves the whole chain
             this.applyChange({
                 id: crypto.randomUUID(),
                 eventType: 'ApprovalChainCEOOverridden',
                 aggregateType: 'ApprovalChain',
                 aggregateId: this.id,
                 sourceModule: 'Approvals',
                 payload: { targetType: this.state.targetType, targetId: this.state.targetId, overriddenBy: userId },
                 createdAt: new Date(),
                 createdBy: userId
             });
        } else {
             allApproved = this.state.steps.every(s => 
                 s.order === order ? true : s.status === 'APPROVED' || s.status === 'SKIPPED'
             );
        }

        if (allApproved) {
            this.applyChange({
                id: crypto.randomUUID(),
                eventType: SystemEvents.APPROVAL_GRANTED,
                aggregateType: 'ApprovalChain',
                aggregateId: this.id,
                sourceModule: 'Approvals',
                payload: { targetType: this.state.targetType, targetId: this.state.targetId, domain: this.state.domain },
                createdAt: new Date(),
                createdBy: 'SYSTEM'
            });
        }
    }

    rejectChain(order: number, userId: string, userRole: string, comments: string) {
        if (this.state.status !== 'REQUESTED') throw new Error("Chain is closed.");
        const isCEO = userRole === 'CEO';

        const step = this.state.steps.find(s => s.order === order);
        if (!step && !isCEO) throw new Error("Step not found");
        if (step && step.requiredRole !== userRole && !isCEO) {
             throw new Error(`Unauthorized to reject this step. Required: ${step.requiredRole}`);
        }
        
        this.applyChange({
             id: crypto.randomUUID(),
             eventType: SystemEvents.APPROVAL_REJECTED,
             aggregateType: 'ApprovalChain',
             aggregateId: this.id,
             sourceModule: 'Approvals',
             payload: { targetType: this.state.targetType, targetId: this.state.targetId, domain: this.state.domain, comments, rejectedByRole: userRole },
             createdAt: new Date(),
             createdBy: userId
        });
    }

    protected mutate(event: SystemEvent): void {
        if (event.eventType === 'ApprovalStepApproved') {
            const step = this.state.steps.find(s => s.order === event.payload.order);
            if (step) step.status = 'APPROVED';
            
            if (event.payload.isCEOOverride) {
                this.state.steps.forEach(s => {
                    if (s.status === 'PENDING') s.status = 'SKIPPED';
                });
            }
        } else if (event.eventType === SystemEvents.APPROVAL_GRANTED) {
            this.state.status = 'APPROVED';
        } else if (event.eventType === SystemEvents.APPROVAL_REJECTED) {
            this.state.status = 'REJECTED';
            this.state.steps.forEach(s => {
                 if (s.status === 'PENDING') s.status = 'REJECTED';
            });
        }
    }
}

export class ApprovalEngine {
    
    async requestApproval(params: {
         agencyId: string;
         targetType: string;
         targetId: string;
         domain: string;
         title: string;
         amountValue?: number;
         justification?: string;
    }): Promise<string> {
         const chainId = crypto.randomUUID();
         
         const steps: ApprovalStep[] = [];
         
         // Threshold-based hierarchical rules
         if (params.domain === 'Finance' && params.amountValue) {
             if (params.amountValue <= 100000) {
                 steps.push({ order: 1, requiredRole: 'FINANCE_MANAGER', status: 'PENDING' });
             } else if (params.amountValue <= 1000000) {
                 steps.push({ order: 1, requiredRole: 'FINANCE_MANAGER', status: 'PENDING' });
                 steps.push({ order: 2, requiredRole: 'FINANCE_DIRECTOR', status: 'PENDING' });
             } else {
                 steps.push({ order: 1, requiredRole: 'FINANCE_DIRECTOR', status: 'PENDING' });
                 steps.push({ order: 2, requiredRole: 'CEO', status: 'PENDING' });
             }
         } else if (params.domain === 'Procurement') {
             steps.push({ order: 1, requiredRole: 'PROCUREMENT_MANAGER', status: 'PENDING' });
             if (params.amountValue && params.amountValue > 500000) {
                 steps.push({ order: 2, requiredRole: 'CFO', status: 'PENDING' });
             }
         } else {
             // Default rule
             steps.push({ order: 1, requiredRole: 'MANAGER', status: 'PENDING' });
         }

         // Save to DB (approval_chains table)
         await kernel.mutate('approval_chains', 'INSERT', {
              id: chainId,
              agency_id: params.agencyId,
              target_type: params.targetType,
              target_id: params.targetId,
              domain: params.domain,
              status: 'REQUESTED'
         });

         for (const s of steps) {
              await kernel.mutate('approval_steps', 'INSERT', {
                   chain_id: chainId,
                   step_order: s.order,
                   required_role: s.requiredRole,
                   status: s.status
              });
         }

         // Trigger inbox task for the first step
         const firstStep = steps[0]!;
         
         const taskData: any = {
             agency_id: params.agencyId,
             task_type: 'APPROVAL_REQUIRED',
             title: params.title,
             priority: 'HIGH',
             status: 'PENDING',
             role_target: firstStep.requiredRole,
             domain: params.domain,
             reference_aggregate_type: 'ApprovalChain',
             reference_aggregate_id: chainId,
             sla_breach_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24hr SLA for approvals
         };
         
         if (params.justification) {
             taskData.description = params.justification;
         }

         await inboxEngine.generateTask(taskData);

         await eventBus.publish({
             id: crypto.randomUUID(),
             eventType: SystemEvents.APPROVAL_REQUESTED,
             aggregateType: 'ApprovalChain',
             aggregateId: chainId,
             sourceModule: 'Approvals',
             payload: params,
             createdAt: new Date(),
             createdBy: 'SYSTEM'
         });

         return chainId;
    }
}

export const approvalEngine = new ApprovalEngine();
