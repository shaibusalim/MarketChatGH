import { firestore } from "@/lib/firebase-admin";
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
  products: Product[];
  active: boolean;
}

// --- Fetch sellers and products ---
async function getSellersAndProducts(): Promise<Seller[]> {
  const sellersSnapshot = await firestore.collection("sellers").get();
  const productsSnapshot = await firestore.collection("products").get();

  const sellers: Seller[] = [];

  sellersSnapshot.forEach((sellerDoc) => {
    const sellerId = sellerDoc.id;
    const active = sellerDoc.data().active ?? true;
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
                      Seller ID: {seller.id} ({seller.products.length} products){" "}
                      {seller.active ? (
                        <span className="ml-2 text-green-600">(Active)</span>
                      ) : (
                        <span className="ml-2 text-red-600">(Inactive)</span>
                      )}
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
                                <Image
                                  src={product.imageUrl}
                                  alt={product.description}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover border"
                                />
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
