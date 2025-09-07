import {NextRequest, NextResponse} from 'next/server';
import {shoppingAssistantFlow} from '@/ai/flows/shopping-assistant';

export async function POST(req: NextRequest) {
  const {message} = await req.json();

  if (!message) {
    return NextResponse.json({error: 'Message is required'}, {status: 400});
  }

  try {
    const {reply} = await shoppingAssistantFlow({message});
    return NextResponse.json({reply});
  } catch (error) {
    console.error('Error in shopping assistant flow:', error);
    return NextResponse.json({error: 'Something went wrong'}, {status: 500});
  }
}
