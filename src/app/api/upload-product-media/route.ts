import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore, adminStorage } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  console.log('[API] POST /api/upload-product-media route accessed');
  try {
    const session = await getServerSession();
    if (!session?.user?.phoneNumber) {
      console.warn('[API] Unauthorized access attempt');
      return new NextResponse(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    const formData = await req.formData();
    const productId = (formData.get('productId') as string)?.trim();
    const image = formData.get('image') as File | null;
    const video = formData.get('video') as File | null;

    console.log(`[API] Form data: productId=${productId}, image=${!!image}, video=${!!video}`);

    if (!productId || (!image && !video)) {
      console.warn('[API] Missing required fields');
      return new NextResponse(null, {
        status: 400,
        statusText: 'Missing productId or media',
      });
    }

    const bucket = adminStorage.bucket();
    const updates: { imageUrl?: string; videoUrl?: string } = {};

    if (image) {
      const imageName = `products/${productId}/image_${Date.now()}_${image.name}`;
      const imageFile = bucket.file(imageName);
      await imageFile.save(Buffer.from(await image.arrayBuffer()), {
        metadata: { contentType: image.type },
      });
      const [imageUrl] = await imageFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      updates.imageUrl = imageUrl;
    }

    if (video) {
      if (!['video/mp4', 'video/webm'].includes(video.type)) {
        console.warn('[API] Invalid video format');
        return new NextResponse(null, {
          status: 400,
          statusText: 'Invalid video format. Use MP4 or WebM.',
        });
      }
      if (video.size > 100 * 1024 * 1024) {
        console.warn('[API] Video size exceeds 100MB');
        return new NextResponse(null, {
          status: 400,
          statusText: 'Video size exceeds 100MB.',
        });
      }
      const videoName = `products/${productId}/video_${Date.now()}_${video.name}`;
      const videoFile = bucket.file(videoName);
      await videoFile.save(Buffer.from(await video.arrayBuffer()), {
        metadata: { contentType: video.type },
      });
      const [videoUrl] = await videoFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2500',
      });
      updates.videoUrl = videoUrl;
    }

    await adminFirestore.collection('products').doc(productId).set(updates, { merge: true });

    console.log(`[API] Media uploaded for product ${productId}`);
    return new NextResponse(null, {
      status: 200,
      headers: { Location: '/seller' },
    });
  } catch (error) {
    console.error('[API] Error in POST /api/upload-product-media:', error);
    return new NextResponse(null, {
      status: 500,
      statusText: (error as Error).message,
      headers: { Location: '/seller' },
    });
  }
}