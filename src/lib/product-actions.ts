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
  location?: string;
  active?: boolean;
  products?: Product[];
  summary?: string;
}

// --- Firestore query ---
export const getProducts = async (
  searchQuery: string = '',
  filter: string = 'all',
  sort: string = 'createdAt-desc',
  pageSize: number = 10,
  startAfterId?: string
): Promise<{ products: Product[]; sellers: Map<string, Seller>; total: number; lastDocId?: string }> => {
  try {
    let productsQuery: FirebaseFirestore.Query = adminFirestore.collection("products");

    // Apply filters and sorting
    if (searchQuery) {
      productsQuery = productsQuery
        .where("description", ">=", searchQuery)
        .where("description", "<=", searchQuery + '\uf8ff');
    }
    if (filter !== 'all') {
      if (filter === 'in-stock') productsQuery = productsQuery.where("isAvailable", "==", true);
      if (filter === 'out-of-stock') productsQuery = productsQuery.where("isAvailable", "==", false);
      if (filter === 'new') productsQuery = productsQuery.where("status", "==", "new");
      if (filter === 'used') productsQuery = productsQuery.where("status", "==", "used");
    }
    const sortField = sort.includes('price') ? 'price' : 'createdAt';
    const sortDirection = sort.includes('desc') ? 'desc' : 'asc';
    productsQuery = productsQuery.orderBy(sortField, sortDirection);

    if (startAfterId) {
      const startAfterDoc = await adminFirestore.collection("products").doc(startAfterId).get();
      if (startAfterDoc.exists) {
        productsQuery = productsQuery.startAfter(startAfterDoc);
      } else {
        return { products: [], sellers: new Map(), total: 0, lastDocId: undefined };
      }
    }

    productsQuery = productsQuery.limit(pageSize);
    const productsSnapshot = await productsQuery.get();

    const sellersSnapshot = await adminFirestore.collection("sellers").get();

    const sellers: Map<string, Seller> = new Map();
    sellersSnapshot.forEach((doc) => {
      const data = doc.data();
      const name = typeof data.name === 'string' ? data.name.slice(0, 100) : "Unnamed Seller";
      sellers.set(doc.id, { id: doc.id, name });
    });

    const products = productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      const description = typeof data.description === 'string' ? data.description.slice(0, 1000) : "No description";
      const imageUrl = typeof data.imageUrl === 'string' ? data.imageUrl.slice(0, 1000) : "/img1.jpg";
      if (!data.imageUrl) {
        console.warn(`Product ${doc.id} missing imageUrl:`, {
          description: description.substring(0, 30),
          sellerId: data.sellerId,
          status: data.status,
        });
      }
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
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;

    return { products, sellers, total, lastDocId: lastDoc?.id };
  } catch (error: any) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

export const getSellers = async (
  pageSize: number = 6
): Promise<Seller[]> => {
  try {
    const sellersSnapshot = await adminFirestore.collection("sellers").limit(pageSize).get();
    const sellers: Seller[] = [];

    for (const doc of sellersSnapshot.docs) {
      const data = doc.data();
      const sellerId = doc.id;

      // Fetch a few products for preview
      const productsSnapshot = await adminFirestore.collection("products")
        .where("sellerId", "==", sellerId)
        .limit(3)
        .get();

      const products = productsSnapshot.docs.map((pDoc) => ({
        id: pDoc.id,
        imageUrl: pDoc.data().imageUrl ?? "/img1.jpg",
        price: pDoc.data().price ?? "N/A",
        description: pDoc.data().description ?? "No description",
        sellerId: pDoc.data().sellerId ?? "",
        createdAt: pDoc.data().createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
        status: pDoc.data().status ?? "unknown",
        stockStatus: pDoc.data().stockStatus ?? "unknown",
        isAvailable: pDoc.data().isAvailable ?? false,
      })) as Product[];

      sellers.push({
        id: sellerId,
        name: data.name ?? "Unnamed Seller",
        location: data.location ?? "Unknown",
        active: data.active ?? true,
        summary: data.summary ?? "No description available",
        products
      });
    }

    return sellers;
  } catch (error: any) {
    throw new Error(`Failed to fetch sellers: ${error.message}`);
  }
};
