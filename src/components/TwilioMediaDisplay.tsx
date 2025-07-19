// components/TwilioMediaDisplay.tsx
'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface TwilioMediaDisplayProps {
  mediaUrl: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function TwilioMediaDisplay({ 
  mediaUrl, 
  alt, 
  width, 
  height, 
  className 
}: TwilioMediaDisplayProps) {
  const [src, setSrc] = useState('/placeholder-product.jpg');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (mediaUrl.startsWith('/api/twilio-media')) {
          // Our proxy URL - test if it works
          const response = await fetch(mediaUrl, { 
            signal,
            method: 'HEAD' // Just check if the resource exists
          });
          
          if (response.ok) {
            setSrc(mediaUrl);
          } else {
            throw new Error(`Proxy returned ${response.status}`);
          }
        } else if (mediaUrl.includes('api.twilio.com')) {
          // Legacy Twilio URL - extract media SID and use our proxy
          const mediaSid = mediaUrl.split('/Media/')[1]?.split('/')[0];
          if (mediaSid) {
            const proxyUrl = `/api/twilio-media?sid=${mediaSid}`;
            const response = await fetch(proxyUrl, { 
              signal,
              method: 'HEAD'
            });
            
            if (response.ok) {
              setSrc(proxyUrl);
            } else {
              throw new Error('Failed to load via proxy');
            }
          } else {
            throw new Error('Invalid Twilio media URL format');
          }
        } else if (mediaUrl && mediaUrl !== '/placeholder-product.jpg') {
          // Regular image URL - test if accessible
          const response = await fetch(mediaUrl, { 
            signal,
            method: 'HEAD'
          });
          
          if (response.ok) {
            setSrc(mediaUrl);
          } else {
            throw new Error('External image not accessible');
          }
        }
      } catch (error) {
        if (!signal.aborted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error loading image:', errorMessage, 'URL:', mediaUrl);
          setError(errorMessage);
          setSrc('/placeholder-product.jpg');
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (mediaUrl) {
      loadImage();
    } else {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [mediaUrl]);

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}
      
      {error && !loading && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-md flex items-center justify-center">
          <div className="text-xs text-red-600 text-center p-2">
            Failed to load image
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs mt-1 opacity-70">{error}</div>
            )}
          </div>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-md"
        unoptimized
        onError={(e) => {
          console.error('Image onError triggered:', e);
          setSrc('/placeholder-product.jpg');
          setError('Image failed to render');
        }}
        onLoad={() => {
          setError(null);
        }}
      />
    </div>
  );
}