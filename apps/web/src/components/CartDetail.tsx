'use client';
import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "@e-commerce/types";
import { Stack, Box } from "@e-commerce/ui";

export function CartDetail() {
  const { cartItems, removeFromCart } = useCart();

  const removeItem = async (cartItemId: string) => {
    await removeFromCart(cartItemId);
  };

  return (
    <Stack className="flex-col gap-3 pt-5">
      {cartItems.map((item) => (
        <Box key={item.productId}>
          <CartItemDetail item={item} removeItem={removeItem} />
        </Box>
      ))}
    </Stack>
  );
}

interface CartItemDetailProps {
  item: CartItem;
  removeItem?: (cartItemId: string) => Promise<void>;
}

export function CartItemDetail({ item, removeItem }: CartItemDetailProps) {
  const {
    cartItemId,
    quantity,
    productName: name,
    productDescription: description,
    unitPrice: price,
    imageUrl,
  } = item;

  return (
    cartItemId && (
      <div className="flex w-full flex-row items-center justify-between rounded-lg border border-gray-300 bg-gray-200 p-1 pr-5 dark:bg-gray-500">
        <div className="flex flex-row items-center">
          <Image
            src={imageUrl}
            alt={name}
            width={50}
            height={50}
            className="rounded-md"
          />
          <Stack className="flex-col">
            <div className="mx-5">{name}</div>
            <div className="mx-5 text-xs">{description}</div>
          </Stack>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12">Qty: {quantity}</div>
          <div className="flex flex-col items-start">
            <span>${(price * quantity).toFixed(2)}</span>
            {quantity > 1 && (
              <span className="text-xs">{`($${price.toFixed(2)} ea)`}</span>
            )}
          </div>
          {removeItem && (
            <FaTrash
              style={{ fontSize: "0.9em", cursor: "pointer" }}
              onClick={() => removeItem(cartItemId)}
            />
          )}
        </div>
      </div>
    )
  );
}
