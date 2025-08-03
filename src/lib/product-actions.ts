"use server";

import { adminFirestore } from "@/lib/firebase-admin";

// --- Types ---
export interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: Date;
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
): Promise<{ products: Product[]; sellers: Map<string, Seller>; total: number; lastDoc?: any }> => {
  let productsQuery: FirebaseFirestore.Query = adminFirestore.collection("products");

  // Apply filters and sorting
  if (searchQuery) {
    productsQuery = productsQuery.where("description", ">=", searchQuery).where("description", "<=", searchQuery + '\uf8ff');
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
    }
  }
  
  const productsSnapshot = await productsQuery.limit(pageSize).get();
  const sellersSnapshot = await adminFirestore.collection("sellers").get();

  const sellers: Map<string, Seller> = new Map();
  sellersSnapshot.forEach((doc) => {
    const data = doc.data();
    sellers.set(doc.id, { id: doc.id, name: data.name ?? "Unnamed Seller" });
  });

  const products = productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      imageUrl: data.imageUrl ?? "/placeholder-product.jpg",
      price: data.price ?? "Price not specified",
      description: data.description ?? "No description",
      sellerId: data.sellerId ?? "",
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      status: data.status ?? "unknown",
      stockStatus: data.stockStatus ?? "unknown",
      isAvailable: data.isAvailable ?? false,
    } as Product;
  });

  const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
  
  let totalQuery: FirebaseFirestore.Query = adminFirestore.collection("products");
  if (searchQuery) {
    totalQuery = totalQuery.where("description", ">=", searchQuery).where("description", "<=", searchQuery + '\uf8ff');
  }
  if (filter !== 'all') {
    if (filter === 'in-stock') totalQuery = totalQuery.where("isAvailable", "==", true);
    if (filter === 'out-of-stock') totalQuery = totalQuery.where("isAvailable", "==", false);
    if (filter === 'new') totalQuery = totalQuery.where("status", "==", "new");
    if (filter === 'used') totalQuery = totalQuery.where("status", "==", "used");
  }
  const totalSnapshot = await totalQuery.get();
  const total = totalSnapshot.size;

  return { products, sellers, total, lastDoc };
};
