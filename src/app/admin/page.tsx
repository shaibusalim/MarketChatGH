import { firestore } from "@/lib/firebase";
import admin from "firebase-admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Package } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: admin.firestore.Timestamp | Date;
}

interface Seller {
  id: string;
  products: Product[];
}

async function getSellersAndProducts(): Promise<Seller[]> {
  if (!firestore) {
    console.error("Firestore is not initialized.");
    return [];
  }

  const productsSnapshot = await firestore
    .collection("products")
    .orderBy("sellerId")
    .orderBy("createdAt", "desc")
    .get();

  if (productsSnapshot.empty) {
    return [];
  }

  const productsBySeller = productsSnapshot.docs.reduce((acc, doc) => {
    const productData = doc.data() as Omit<Product, "id">;
    const sellerId = productData.sellerId;

    if (!acc[sellerId]) {
      acc[sellerId] = [];
    }

    acc[sellerId].push({
      id: doc.id,
      ...productData,
      createdAt: (productData.createdAt as admin.firestore.Timestamp).toDate(),
    });

    return acc;
  }, {} as Record<string, Product[]>);
  
  const demoProducts: Product[] = [
    {
      id: 'demo-1',
      description: 'Authentic Kente Cloth',
      price: '₵150',
      imageUrl: 'https://placehold.co/600x600.png',
      sellerId: 'demo',
      createdAt: new Date(),
    },
    {
      id: 'demo-2',
      description: 'Hand-carved Wooden Mask',
      price: '₵85',
      imageUrl: 'https://placehold.co/600x600.png',
      sellerId: 'demo',
      createdAt: new Date(),
    },
    {
      id: 'demo-3',
      description: 'Beaded Necklace',
      price: '₵45',
      imageUrl: 'https://placehold.co/600x600.png',
      sellerId: 'demo',
      createdAt: new Date(),
    }
  ];

  productsBySeller["demo"] = demoProducts;


  return Object.entries(productsBySeller).map(([sellerId, products]) => ({
    id: sellerId,
    products,
  }));
}

export default async function AdminPage() {
  const sellers = await getSellersAndProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-10">
        <div className="inline-block bg-primary p-4 rounded-full mb-4">
          <Shield className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor all sellers and products on MarketChat GH.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User /> Sellers ({sellers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sellers.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sellers.map((seller) => (
                <AccordionItem value={seller.id} key={seller.id}>
                  <AccordionTrigger className="font-bold">
                    Seller ID: {seller.id} ({seller.products.length} products)
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Date Added</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seller.products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Image
                                src={product.imageUrl}
                                alt={product.description}
                                width={60}
                                height={60}
                                className="rounded-md object-cover"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{product.description}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>
                              {new Date(product.createdAt.seconds * 1000).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10 bg-secondary rounded-lg">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold font-headline">No Products Found</h2>
              <p className="text-muted-foreground mt-1">
                When sellers add products, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}