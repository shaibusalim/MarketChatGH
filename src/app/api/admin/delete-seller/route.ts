import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminFirestore } from '@/lib/firebase-admin';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  console.log('[API] POST /api/admin/delete-seller route accessed');
  try {
    const session = await getServerSession(authOptions);
    console.log('[API] Session:', session ? JSON.stringify(session) : 'No session');
    if (!session || !session.user.isAdmin) {
      console.log('[API] Unauthorized access attempt. Session:', session ? 'Present but not admin' : 'Missing');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sellerId } = await request.json();
    console.log('[API] Deleting seller:', sellerId);
    if (!sellerId) {
      console.log('[API] Missing sellerId in request body');
      return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
    }

    const batch = adminFirestore.batch();
    const sellerRef = adminFirestore.collection('sellers').doc(sellerId);
    batch.delete(sellerRef);

    const productsSnapshot = await adminFirestore
      .collection('products')
      .where('sellerId', '==', sellerId)
      .get();
    productsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`[API] Successfully deleted seller ${sellerId} and their products`);

    return NextResponse.json({ message: 'Seller and their products deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[API] Error deleting seller:', error);
    return NextResponse.json(
      { error: 'Failed to delete seller', details: (error as Error).message },
      { status: 500 }
    );
  }
}