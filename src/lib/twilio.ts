import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error('Twilio credentials are not set in environment variables.');
}

export const twilioClient = twilio(accountSid, authToken);
export const TwilioMessagingResponse = twilio.twiml.MessagingResponse;
