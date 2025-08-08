'use client';
import { useCart } from "@/contexts/CartContext";
import { Stack, Box, Loading } from "@e-commerce/ui";
import { CartSummary } from "./CartSummary";
import { CartDetail } from "./CartDetail";

export function Cart() {
  const { cartItems, loading } = useCart();

  if (loading || cartItems.length === 0) {
    return (
      <Box className="p-20">
        <Loading />
      </Box>
    );
  }

  return (
    <div>
      {cartItems.length > 0 ? (
        <Box>
          <Stack className="w-full items-center gap-2.5">
            <Box className="text-2xl font-bold">Cart</Box>
            <Box className="text-lg">{`(${cartItems.length} items)`}</Box>
          </Stack>
          <CartDetail />
          <CartSummary />
        </Box>
      ) : (
        <Box className="text-lg">{"Your cart is empty"}</Box>
      )}
    </div>
  );
}
