"use client";
import Image from "next/image";
import { useProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@e-commerce/types";
import { Stack } from "../../../../packages/ui/src/stack";
import { Box, Button, Loading } from "@e-commerce/ui";

export function Products() {
  const { products, loading } = useProducts();

  if (loading || products.length === 0) {
    return (
      <Box className="p-20">
        <Loading />
      </Box>
    );
  }

  return (
    <Box>
      <Box className="text-2xl font-bold">Products</Box>
      <Stack className="list-none flex-col gap-3 pt-5">
        {products.map((product) => (
          <Box key={product.productId}>
            <ProductDetails product={product} />
          </Box>
        ))}
      </Stack>
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
    <Box className="w-full, flex items-center rounded-lg border border-gray-300 bg-gray-200 p-1 pr-2 dark:bg-gray-500">
      <Image
        src={imageUrl ?? ""}
        alt={name}
        width={125}
        height={125}
        className="rounded-lg p-1"
      />
      <Box className="mitems-center w-full justify-between md:flex">
        <Box className="flex flex-col px-4 gap-2 md:gap-2">
          <Stack className="flex-col">
            <Box className="text-nowrap">{name}</Box>
            <Box className="text-xs text-nowrap">{description}</Box>
          </Stack>
          <Box>{`$${price}`}</Box>
        </Box>
        <Button
          className="primary-button mx-4 mt-2 pl-1"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>
      </Box>
    </Box>
  );
}
