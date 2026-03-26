'use client';

import Image from 'next/image';

interface TwilioMediaDisplayProps {
  mediaUrl: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function TwilioMediaDisplay({
  mediaUrl,
  alt,
  width,
  height,
  className,
  loading = 'lazy',
}: TwilioMediaDisplayProps) {
  // Helper to ensure Twilio URLs are proxied
  const getProxiedUrl = (url: string) => {
    if (!url) return '/background-fallback.jpg';
    
    // If it's already a proxied URL or a local path, return as is
    if (url.startsWith('/api/twilio-media') || url.startsWith('/') || !url.startsWith('http')) {
      return url;
    }

    // If it's a raw Twilio URL, convert to proxy URL
    if (url.includes('api.twilio.com')) {
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        // Extract Media SID from the end of the path
        const mediaSid = pathParts.pop() || pathParts.pop(); 
        // Find Message SID (starts with MM)
        const messageSidPart = pathParts.find(part => part.startsWith('MM'));
        
        if (mediaSid && mediaSid.startsWith('ME')) {
          return `/api/twilio-media?sid=${mediaSid}${messageSidPart ? `&msgSid=${messageSidPart}` : ''}`;
        }
      } catch (e) {
        console.error('Error parsing Twilio URL:', e);
      }
    }

    return url;
  };

  const finalUrl = getProxiedUrl(mediaUrl);

  return (
    <Image
      src={finalUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      unoptimized={
        finalUrl.includes('ngrok') ||
        finalUrl.includes('twilio') ||
        finalUrl.includes('media-api') ||
        finalUrl.startsWith('/api/twilio-media')
      }
    />
  );
}
