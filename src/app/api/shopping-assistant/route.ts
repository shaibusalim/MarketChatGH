import {NextRequest, NextResponse} from 'next/server';
import {shoppingAssistantFlow} from '@/ai/flows/shopping-assistant';
import {enforceRateLimit} from '@/lib/ratelimit';

const MAX_MESSAGE_LENGTH = 500;

export async function POST(req: NextRequest) {
  // Protect the Gemini bill: 10 messages / minute and 60 / hour per IP.
  const burstLimited = await enforceRateLimit(req, 'assistant-burst', 10, '1 m');
  if (burstLimited) return burstLimited;
  const hourlyLimited = await enforceRateLimit(req, 'assistant-hourly', 60, '1 h');
  if (hourlyLimited) return hourlyLimited;

  let message: unknown;
  try {
    ({message} = await req.json());
  } catch {
    return NextResponse.json({error: 'Invalid request body'}, {status: 400});
  }

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({error: 'Message is required'}, {status: 400});
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`},
      {status: 400},
    );
  }

  try {
    const {reply} = await shoppingAssistantFlow({message: message.trim()});
    return NextResponse.json({reply});
  } catch (error) {
    console.error('Error in shopping assistant flow:', error);
    return NextResponse.json({error: 'Something went wrong'}, {status: 500});
  }
}
