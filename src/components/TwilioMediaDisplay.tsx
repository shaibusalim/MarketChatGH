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
  return (
    <Image
      src={mediaUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      unoptimized={mediaUrl.includes('ngrok') || mediaUrl.includes('twilio')}
    />
  );
}