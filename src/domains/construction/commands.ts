import { Command } from '@/lib/kernel/core';

export interface AdvanceMilestoneCommand extends Command<{
  agencyId: string;
  projectId: string;
  milestoneId: string;
  completionPercentage: number;
}> {
  type: 'Construction.AdvanceMilestone';
}
