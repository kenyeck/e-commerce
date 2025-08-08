"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { apiClient } from "@/lib/api";
import { CartItem } from "@e-commerce/types";
import { Stack, Box, Card, HorizontalLine, Button } from "@e-commerce/ui";

export function CartSummary() {
  const { cartItems } = useCart();
  const router = useRouter();

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const products = await apiClient.getProducts();
    const response = await apiClient.createCheckoutSession(
      cartItems.map(
        (x) =>
          ({
            ...x,
            stripePriceId: products.find((p) => p.productId === x.productId)
              ?.stripePriceId,
          }) as CartItem,
      ),
    );
    router.push(response.url);
  };

  return (
    <div>
      <Card>
        <Stack className="flex-col justify-between gap-4">
          <Stack className="justify-between">
            <Stack className="items-end">
              <Box className="font-bold">Subtotal</Box>
              <Box className="ml-1">{`(${cartItems.length} items)`}</Box>
            </Stack>
            <Stack className="items-end">
              <Box className="font-bold">{`$${cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)}`}</Box>
            </Stack>
          </Stack>
          <HorizontalLine />
          <Stack className="justify-between text-sm text-gray-500">
            <Box>Shipping</Box>
            <Stack className="items-end">
              <Box>Free</Box>
            </Stack>
          </Stack>
          <Stack className="justify-between">
            <strong>Taxes</strong>
            <Stack className="items-end">
              <Box>Calculated at checkout</Box>
            </Stack>
          </Stack>
          <HorizontalLine />
          <Stack className="justify-between">
            <strong>Estimated total</strong>
            <Stack className="items-end">
              <Box className="font-bold">{`$${cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)}`}</Box>
            </Stack>
          </Stack>
          <Stack className={`mt-5 items-center justify-between`}>
            <Link href="/products">Continue shopping...</Link>
            <Button variant="primary" onClick={handleCheckout}>
              Continue to checkout
            </Button>
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
