import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { adminFirestore, adminStorage } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth.config';
import { enforceRateLimit } from '@/lib/ratelimit';

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const VIDEO_EXTENSIONS: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; isAdmin?: boolean } | undefined;
    if (!user?.id) {
      console.warn('[API] Unauthorized access attempt');
      return new NextResponse(null, { status: 401, statusText: 'Unauthorized' });
    }

    const limited = await enforceRateLimit(req, 'upload-product-media', 20, '10 m');
    if (limited) return limited;

    const formData = await req.formData();
    const productId = (formData.get('productId') as string)?.trim();
    const image = formData.get('image') as File | null;
    const video = formData.get('video') as File | null;

    if (!productId || (!image && !video)) {
      return new NextResponse(null, { status: 400, statusText: 'Missing productId or media' });
    }

    // Ownership check: sellers can only attach media to their own products.
    const productRef = adminFirestore.collection('products').doc(productId);
    const productSnap = await productRef.get();
    if (!productSnap.exists) {
      return new NextResponse(null, { status: 404, statusText: 'Product not found' });
    }
    if (!user.isAdmin && productSnap.data()?.sellerId !== user.id) {
      return new NextResponse(null, { status: 403, statusText: 'Forbidden' });
    }

    const updates: { imageUrl?: string; videoUrl?: string } = {};

    // 1. Process Image Upload
    if (image) {
      const ext = IMAGE_EXTENSIONS[image.type];
      if (!ext) {
        return new NextResponse(null, { status: 400, statusText: 'Invalid image format. Use JPEG, PNG, WebP or GIF.' });
      }
      if (image.size > 4.5 * 1024 * 1024) {
        return new NextResponse(null, { status: 400, statusText: 'Image size exceeds 4.5MB.' });
      }

      const filename = `products/${productId}/image_${Date.now()}.${ext}`;

      // A. Try Vercel Blob first
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(filename, image, {
            access: 'public',
            contentType: image.type,
          });
          if (blob?.url) {
            updates.imageUrl = blob.url;
          }
        } catch (blobErr) {
          console.warn('[Product Media API] Blob upload failed, trying Firebase Storage:', blobErr);
        }
      }

      // B. Fallback to Firebase Storage if Blob wasn't used/failed
      if (!updates.imageUrl) {
        try {
          const bucket = adminStorage.bucket();
          const imageFile = bucket.file(filename);
          await imageFile.save(Buffer.from(await image.arrayBuffer()), {
            metadata: { contentType: image.type },
          });
          const [imageUrl] = await imageFile.getSignedUrl({ action: 'read', expires: '03-01-2500' });
          updates.imageUrl = imageUrl;
        } catch (storageErr) {
          console.error('[Product Media API] Storage upload failed:', storageErr);
        }
      }
    }

    // 2. Process Video Upload
    if (video) {
      const ext = VIDEO_EXTENSIONS[video.type];
      if (!ext) {
        return new NextResponse(null, { status: 400, statusText: 'Invalid video format. Use MP4 or WebM.' });
      }
      if (video.size > 100 * 1024 * 1024) {
        return new NextResponse(null, { status: 400, statusText: 'Video size exceeds 100MB.' });
      }

      const filename = `products/${productId}/video_${Date.now()}.${ext}`;

      // A. Try Vercel Blob
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(filename, video, {
            access: 'public',
            contentType: video.type,
          });
          if (blob?.url) {
            updates.videoUrl = blob.url;
          }
        } catch (blobErr) {
          console.warn('[Product Media API] Blob video upload failed, trying Firebase Storage:', blobErr);
        }
      }

      // B. Fallback to Firebase Storage
      if (!updates.videoUrl) {
        try {
          const bucket = adminStorage.bucket();
          const videoFile = bucket.file(filename);
          await videoFile.save(Buffer.from(await video.arrayBuffer()), {
            metadata: { contentType: video.type },
          });
          const [videoUrl] = await videoFile.getSignedUrl({ action: 'read', expires: '03-01-2500' });
          updates.videoUrl = videoUrl;
        } catch (storageErr) {
          console.error('[Product Media API] Video Storage upload failed:', storageErr);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await productRef.set(updates, { merge: true });
    }

    return new NextResponse(null, { status: 200, headers: { Location: '/seller' } });
  } catch (error) {
    console.error('[API upload-product-media] Error:', error);
    return new NextResponse(null, { status: 500, statusText: 'Upload failed' });
  }
}
