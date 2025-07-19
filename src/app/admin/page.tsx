import { adminFirestore } from "@/lib/firebase-admin";
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
import { Button } from "@/components/ui/button";
import { Shield, User, Package, LogOut } from "lucide-react";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";


// --- Types ---
interface Product {
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

interface Seller {
  id: string;
  name: string;
  location: string;
  active: boolean;
  products: Product[];
}

// --- Fetch sellers and products ---
async function getSellersAndProducts(): Promise<Seller[]> {
  const sellersSnapshot = await adminFirestore.collection("sellers").get();
const productsSnapshot = await adminFirestore.collection("products").get();

const sellers: Seller[] = [];

sellersSnapshot.forEach((sellerDoc) => {
  const sellerId = sellerDoc.id;
  const data = sellerDoc.data();
  const active = data.active ?? true;

  const products = productsSnapshot.docs
    .filter((p) => p.data().sellerId === sellerId)
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as Product;
    });

  sellers.push({
    id: sellerId,
    name: data.name ?? "Unnamed Seller",
    location: data.location ?? "Unknown",
    active,
    products,
  });
});

  return sellers;
}

// --- Admin page component ---
export default async function AdminPage() {
  const sellers = await getSellersAndProducts();

  

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-10 bg-primary/10 p-4 rounded-xl shadow">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold font-headline">Admin Dashboard</h1>
        </div>
        <LogoutButton />
      </header>

      <Card className="mb-6 shadow-md p-4">
  <h2 className="text-xl font-semibold mb-4">Onboard New Seller</h2>
  <form action="/admin/onboard-seller" method="POST" className="grid md:grid-cols-3 gap-4">
    <input
      name="sellerId"
      required
      placeholder="Phone Number (e.g. +233501234567)"
      className="border rounded px-3 py-2 w-full"
    />
    <input
      name="name"
      required
      placeholder="Seller Name"
      className="border rounded px-3 py-2 w-full"
    />
    <input
      name="location"
      required
      placeholder="Location"
      className="border rounded px-3 py-2 w-full"
    />
    <Button type="submit" className="col-span-full md:col-span-1 mt-2">
      Register Seller
    </Button>
  </form>
</Card>


      <section className="grid grid-cols-1 gap-6">
        <Card className="border-primary shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <User /> Sellers ({sellers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sellers.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {sellers.map((seller) => (
                  <AccordionItem value={seller.id} key={seller.id} className="border-b">
                    <AccordionTrigger className="font-semibold hover:text-primary transition-colors">
  <div>
    <div>
      <strong>{seller.name}</strong> ({seller.location})
    </div>
    <div className="text-sm text-muted-foreground">
      ID: {seller.id} • {seller.products.length} products
      {seller.active ? (
        <span className="ml-2 text-green-600">(Active)</span>
      ) : (
        <span className="ml-2 text-red-600">(Inactive)</span>
      )}
    </div>
  </div>
</AccordionTrigger>

                    <AccordionContent>
                      <div className="flex items-center gap-4 mb-4">
                        <form
                          action={`/admin/toggle-seller?sellerId=${seller.id}&active=${!seller.active}`}
                          method="post"
                        >
                          <Button
                            type="submit"
                            variant={seller.active ? "destructive" : "default"}
                          >
                            {seller.active ? "Deactivate Seller" : "Reactivate Seller"}
                          </Button>
                        </form>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {seller.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                
                              </TableCell>
                              <TableCell>{product.description}</TableCell>
                              <TableCell>₵{product.price}</TableCell>
                              <TableCell>{product.status}</TableCell>
                              <TableCell>{product.stockStatus}</TableCell>
                              <TableCell>
                                <form
                                  action={`/admin/update-product`}
                                  method="post"
                                  className="flex flex-col gap-1"
                                >
                                  <input type="hidden" name="productId" value={product.id} />

                                  <Button
                                    type="submit"
                                    name="action"
                                    value="markAvailable"
                                    size="sm"
                                  >
                                    In Stock
                                  </Button>
                                  <Button
                                    type="submit"
                                    name="action"
                                    value="markOutOfStock"
                                    variant="outline"
                                    size="sm"
                                  >
                                    Out of Stock
                                  </Button>
                                  <Button
                                    type="submit"
                                    name="action"
                                    value="delete"
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Delete
                                  </Button>
                                </form>
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
              <div className="text-center py-10 bg-secondary/20 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold font-headline">No Sellers Found</h2>
                <p className="text-muted-foreground mt-1">
                  Once sellers start adding products, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
