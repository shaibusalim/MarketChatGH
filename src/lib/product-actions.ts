"use server";

import { adminFirestore } from "@/lib/firebase-admin";

// --- Types ---
export interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: string; // Changed to string for serialization
  status: string;
  stockStatus: string;
  isAvailable: boolean;
}

export interface Seller {
  id: string;
  name: string;
}

// --- Firestore query ---
export const getProducts = async (
  searchQuery: string = '',
  filter: string = 'all',
  sort: string = 'createdAt-desc',
  pageSize: number = 10,
  startAfterId?: string
): Promise<{ products: Product[]; sellers: Map<string, Seller>; total: number; lastDocId?: string }> => {
  console.log('[getProducts] Starting with params:', { searchQuery, filter, sort, pageSize, startAfterId });

  try {
    let productsQuery: FirebaseFirestore.Query = adminFirestore.collection("products");

    // Apply filters and sorting
    if (searchQuery) {
      console.log('[getProducts] Applying search query:', searchQuery);
      productsQuery = productsQuery
        .where("description", ">=", searchQuery)
        .where("description", "<=", searchQuery + '\uf8ff');
    }
    if (filter !== 'all') {
      console.log('[getProducts] Applying filter:', filter);
      if (filter === 'in-stock') productsQuery = productsQuery.where("isAvailable", "==", true);
      if (filter === 'out-of-stock') productsQuery = productsQuery.where("isAvailable", "==", false);
      if (filter === 'new') productsQuery = productsQuery.where("status", "==", "new");
      if (filter === 'used') productsQuery = productsQuery.where("status", "==", "used");
    }
    const sortField = sort.includes('price') ? 'price' : 'createdAt';
    const sortDirection = sort.includes('desc') ? 'desc' : 'asc';
    console.log('[getProducts] Applying sort:', { sortField, sortDirection });
    productsQuery = productsQuery.orderBy(sortField, sortDirection);

    if (startAfterId) {
      console.log('[getProducts] Fetching startAfterDoc:', startAfterId);
      const startAfterDoc = await adminFirestore.collection("products").doc(startAfterId).get();
      if (startAfterDoc.exists) {
        console.log('[getProducts] startAfterDoc found:', startAfterDoc.id);
        productsQuery = productsQuery.startAfter(startAfterDoc);
      } else {
        console.log('[getProducts] startAfterDoc does not exist:', startAfterId);
        return { products: [], sellers: new Map(), total: 0, lastDocId: undefined };
      }
    }

    productsQuery = productsQuery.limit(pageSize);
    console.log('[getProducts] Executing products query');
    const productsSnapshot = await productsQuery.get();
    console.log('[getProducts] Products snapshot size:', productsSnapshot.size);

    console.log('[getProducts] Fetching sellers');
    const sellersSnapshot = await adminFirestore.collection("sellers").get();
    console.log('[getProducts] Sellers snapshot size:', sellersSnapshot.size);

    const sellers: Map<string, Seller> = new Map();
    sellersSnapshot.forEach((doc) => {
      const data = doc.data();
      const name = typeof data.name === 'string' ? data.name.slice(0, 100) : "Unnamed Seller";
      sellers.set(doc.id, { id: doc.id, name });
    });

    const products = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log('[getProducts] Mapping product:', doc.id, data);
      const description = typeof data.description === 'string' ? data.description.slice(0, 1000) : "No description";
      const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.slice(0, 1000) : "/placeholder-product.jpg";
      const price = typeof data.price === 'string' ? data.price.slice(0, 100) : "Price not specified";
      const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString();
      return {
        id: doc.id,
        imageUrl,
        price,
        description,
        sellerId: typeof data.sellerId === 'string' ? data.sellerId : "",
        createdAt,
        status: typeof data.status === 'string' ? data.status : "unknown",
        stockStatus: typeof data.stockStatus === 'string' ? data.stockStatus : "unknown",
        isAvailable: typeof data.isAvailable === 'boolean' ? data.isAvailable : false,
      } as Product;
    });

    const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
    console.log('[getProducts] Last doc:', lastDoc?.id);

    let totalQuery: FirebaseFirestore.Query = adminFirestore.collection("products");
    if (searchQuery) {
      totalQuery = totalQuery
        .where("description", ">=", searchQuery)
        .where("description", "<=", searchQuery + '\uf8ff');
    }
    if (filter !== 'all') {
      if (filter === 'in-stock') totalQuery = totalQuery.where("isAvailable", "==", true);
      if (filter === 'out-of-stock') totalQuery = totalQuery.where("isAvailable", "==", false);
      if (filter === 'new') totalQuery = totalQuery.where("status", "==", "new");
      if (filter === 'used') totalQuery = totalQuery.where("status", "==", "used");
    }
    console.log('[getProducts] Executing total query');
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;
    console.log('[getProducts] Total products:', total);

    console.log('[getProducts] Results:', { products: products.length, sellers: sellers.size, total });

    return { products, sellers, total, lastDocId: lastDoc?.id };
  } catch (error: any) {
    console.error('[getProducts] Error:', error.message, error.stack);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};