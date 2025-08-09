import { Suspense } from "react";
import { Products } from "@/components/Products";
import { apiClient } from "@/lib/api";
import { Loading } from "@e-commerce/ui";

export default function ProductsPage() {
   const products = apiClient.getProducts();
   return (
      <Suspense fallback={<Loading />}>
         <Products products={products} />
      </Suspense>
   );
}
