import { NextRequest, NextResponse } from 'next/server';
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
    // NOTE: authOptions must be passed, otherwise the session callbacks (id/role) are not applied.
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

    const bucket = adminStorage.bucket();
    const updates: { imageUrl?: string; videoUrl?: string } = {};

    if (image) {
      const ext = IMAGE_EXTENSIONS[image.type];
      if (!ext) {
        return new NextResponse(null, { status: 400, statusText: 'Invalid image format. Use JPEG, PNG, WebP or GIF.' });
      }
      if (image.size > 4 * 1024 * 1024) {
        return new NextResponse(null, { status: 400, statusText: 'Image size exceeds 4MB.' });
      }
      const imageFile = bucket.file(`products/${productId}/image_${Date.now()}.${ext}`);
      await imageFile.save(Buffer.from(await image.arrayBuffer()), {
        metadata: { contentType: image.type },
      });
      const [imageUrl] = await imageFile.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      updates.imageUrl = imageUrl;
    }

    if (video) {
      const ext = VIDEO_EXTENSIONS[video.type];
      if (!ext) {
        return new NextResponse(null, { status: 400, statusText: 'Invalid video format. Use MP4 or WebM.' });
      }
      if (video.size > 100 * 1024 * 1024) {
        return new NextResponse(null, { status: 400, statusText: 'Video size exceeds 100MB.' });
      }
      const videoFile = bucket.file(`products/${productId}/video_${Date.now()}.${ext}`);
      await videoFile.save(Buffer.from(await video.arrayBuffer()), {
        metadata: { contentType: video.type },
      });
      const [videoUrl] = await videoFile.getSignedUrl({ action: 'read', expires: '03-01-2500' });
      updates.videoUrl = videoUrl;
    }

    await productRef.set(updates, { merge: true });

    return new NextResponse(null, { status: 200, headers: { Location: '/seller' } });
  } catch (error) {
    console.error('[API upload-product-media] Error:', error);
    return new NextResponse(null, { status: 500, statusText: 'Upload failed' });
  }
}
