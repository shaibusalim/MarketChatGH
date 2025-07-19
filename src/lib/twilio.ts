import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error('Twilio credentials are not set in environment variables.');
}

export const twilioClient = twilio(accountSid, authToken);
export const TwilioMessagingResponse = twilio.twiml.MessagingResponse;

// Helper to generate authenticated media URLs
export const getAuthenticatedMediaUrl = (mediaUrl: string) => {
  if (!mediaUrl.includes('api.twilio.com')) return mediaUrl;
  
  const url = new URL(mediaUrl);
  url.username = accountSid || '';
  url.password = authToken || '';
  return url.toString();
};

// Helper to download media with auth
export const downloadTwilioMedia = async (mediaUrl: string) => {
  try {
    const response = await fetch(getAuthenticatedMediaUrl(mediaUrl));
    if (!response.ok) throw new Error('Failed to fetch media');
    return await response.blob();
  } catch (error) {
    console.error('Error downloading Twilio media:', error);
    return null;
  }
};