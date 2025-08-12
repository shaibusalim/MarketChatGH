// app/api/twilio-media/route.ts
import { NextResponse } from 'next/server';
import { twilioClient } from '@/lib/twilio';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaSid = searchParams.get('sid');
  const messageSid = searchParams.get('msgSid'); // Use msgSid for constructing the correct URL

  if (!mediaSid || !messageSid) {
    
    return NextResponse.json({ error: 'Media SID and Message SID required' }, { status: 400 });
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`;
    
    // Construct the correct Twilio media URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages/${messageSid}/Media/${mediaSid}`;
    
    

    const mediaResponse = await fetch(twilioUrl, {
      headers: {
        'Authorization': authHeader,
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!mediaResponse.ok) {
     
      throw new Error(`Twilio API responded with ${mediaResponse.status}`);
    }

    const imageBuffer = await mediaResponse.arrayBuffer();
    const contentType = mediaResponse.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching Twilio media:', error);

    // Attempt to serve placeholder image
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const placeholderResponse = await fetch(`${baseUrl}/placeholder-product.jpg`);
      if (placeholderResponse.ok) {
        const placeholderBuffer = await placeholderResponse.arrayBuffer();
        return new NextResponse(Buffer.from(placeholderBuffer), {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
      console.error('Placeholder image not found');
    } catch (placeholderError) {
      console.error('Error fetching placeholder:', placeholderError);
    }

    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}