import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mediaSid = searchParams.get('sid');
  const messageSid = searchParams.get('msgSid'); // Use msgSid for constructing the correct URL

  if (!mediaSid || !messageSid) {
    
    return NextResponse.json({ error: 'Media SID and Message SID required' }, { status: 400 });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      return NextResponse.json({ error: 'Twilio env not configured' }, { status: 500 });
    }
    const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
    
    // Construct the correct Twilio media URL
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}/Media/${mediaSid}/Content`;
    
    

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const mediaResponse = await fetch(twilioUrl, {
      headers: {
        'Authorization': authHeader,
        'Accept': '*/*',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!mediaResponse.ok) {
     
      throw new Error(`Twilio API responded with ${mediaResponse.status}`);
    }

    const imageBuffer = await mediaResponse.arrayBuffer();
    const contentType = mediaResponse.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching Twilio media:', error);

    // Attempt to serve placeholder image
    try {
      const origin = new URL(request.url).origin;
      const placeholderResponse = await fetch(`${origin}/background-fallback.jpg`);
      if (placeholderResponse.ok) {
        const placeholderBuffer = await placeholderResponse.arrayBuffer();
        return new NextResponse(placeholderBuffer, {
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
