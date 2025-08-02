import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminFirestore } from '@/lib/firebase-admin';
import { authOptions } from '@/auth.config';

export async function POST(request: Request) {
  try {
    // Verify authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request
    const { sellerId } = await request.json();
    if (!sellerId || typeof sellerId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid seller ID' },
        { status: 400 }
      );
    }

    // Create Firestore batch
    const batch = adminFirestore.batch();
    
    // Delete seller
    const sellerRef = adminFirestore.collection('sellers').doc(sellerId);
    batch.delete(sellerRef);

    // Delete associated products
    const productsQuery = await adminFirestore
      .collection('products')
      .where('sellerId', '==', sellerId)
      .get();

    productsQuery.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Execute batch
    await batch.commit();

    return NextResponse.json(
      { success: true, message: 'Seller and products deleted' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete seller error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}