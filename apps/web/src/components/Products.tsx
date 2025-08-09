"use client";
import Image from "next/image";
import { useProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@e-commerce/types";

import { Box, Button, Loading, Stack } from "@e-commerce/ui";

export function Products() {
  const { products, loading } = useProducts();

  return (
    <Box>
      {loading || products.length === 0 ? (
        <Box className="p-20">
          <Loading />
        </Box>
      ) : (
        <>
          <Box className="text-2xl font-bold">Products</Box>
          <Stack className="list-none flex-col gap-3 pt-5">
            {products.map((product) => (
              <Box key={product.productId}>
                <ProductDetails product={product} />
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}

interface ProductProps {
  product: Product;
}

function ProductDetails({ product }: ProductProps) {
  const { name, description, price, imageUrl } = product;
  const { addToCart: addProductToCart } = useCart();

  const addToCart = async (product: Product) => {
    const result = await addProductToCart(product.productId, 1);
    if (result) {
      alert(`${product.name} has been added to your cart!`);
    }
  };

  return (
    <Box className="flex h-38 items-stretch rounded-lg border border-gray-300 bg-gray-200 p-3 dark:bg-gray-500">
      <Image
        src={imageUrl ?? ""}
        alt={name}
        width={125}
        height={125}
        className="rounded-lg"
      />
      <Box id="box1" className="flex w-full flex-col justify-between pl-4">
        <Box className="flex-1">
          <Stack className="flex-col">
            <Box className="text-nowrap">{name}</Box>
            <Box className="text-xs text-nowrap">{description}</Box>
          </Stack>
          <Box>{`$${price}`}</Box>
        </Box>
        <Button
          className="h-9 w-30 cursor-pointer self-end rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>
      </Box>
    </Box>
  );
}
