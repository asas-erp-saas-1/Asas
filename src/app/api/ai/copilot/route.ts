import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { auditLogs, contracts, tickets } from '@/db/schema';
import { db } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    // Allow users to get AI insights if they have permission
    requirePermission(session, 'deals', 'read');

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Attempt to gather context from the environment
    const recentDealsQuery = await db.select({
       ref: contracts.referenceCode,
       price: contracts.agreedPrice,
       status: contracts.status
    }).from(contracts).where(eq(contracts.organizationId, session.organizationId)).orderBy(desc(contracts.createdAt)).limit(5);

    const recentRisksQuery = await db.select({
       type: tickets.category,
       severity: tickets.priority,
       status: tickets.status
    }).from(tickets).where(eq(tickets.organizationId, session.organizationId)).orderBy(desc(tickets.createdAt)).limit(5);

    const context = `
Current Enterprise Context:
- Recent Deals: ${JSON.stringify(recentDealsQuery)}
- Active Risks: ${JSON.stringify(recentRisksQuery)}
`;

    // Try executing AI
    if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
           model: 'gemini-3.5-flash',
           contents: [
             { role: 'user', parts: [{ text: `You are an AI Operational Copilot for a real estate enterprise. Analyze the business context and the user query to provide highly professional, actionable insights. Do not hallucinate data that isn't provided.\n\n${context}\n\nQuery: ${prompt}` }] }
           ]
        });

        return NextResponse.json({ reply: response.text });
    } else {
        // Fallback for missing AI keys during simulation
        return NextResponse.json({ 
            reply: `I see you are asking about: "${prompt}". \n\nLooking at recent data, there are ${recentDealsQuery.length} recent deals, with the latest status being ${recentDealsQuery[0]?.status || 'unknown'}. We currently have ${recentRisksQuery.length} tracked risks.`
        });
    }

  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'AI Copilot' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
