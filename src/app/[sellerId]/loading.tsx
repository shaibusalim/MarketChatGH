import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-3/4 md:w-1/2 mx-auto mb-10" />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="flex flex-col h-full overflow-hidden">
            <CardHeader className="p-0">
              <Skeleton className="w-full aspect-square" />
            </CardHeader>
            <CardContent className="p-4 flex-grow space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-5 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
