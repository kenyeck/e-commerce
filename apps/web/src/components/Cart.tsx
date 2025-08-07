'use client';

import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import { apiClient } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/dist/client/link';
import { useRouter } from 'next/navigation';
import { CartItem } from '@e-commerce/types';
import { Card, Stack, Box, Button, HorizontalLine } from '@e-commerce/ui';

export function Cart() {
   const { cartItems, loading } = useCart();

   if (loading) {
      return <div style={{ fontSize: '2em' }}>Loading...</div>;
   }

   return (
      <>
         {cartItems.length > 0 ? (
            <Box>
               <Stack
                  alignItems="center"
                  gap="10px"
               >
                  <Box fontWeight="bold" fontSize="1.75em">Cart</Box>
                  <Box fontSize="1.5em">{`(${cartItems.length} items)`}</Box>
               </Stack>
               <CartSummary />
            </Box>
         ) : (
            <Box fontSize="1.5em">{'Your cart is empty'}</Box>
         )}
      </>
   );
}

interface CartSummaryProps {
   totalOnly?: boolean;
}
export function CartSummary({ totalOnly }: CartSummaryProps) {
   const { cartItems, removeFromCart } = useCart();
   const router = useRouter();

   const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const products = await apiClient.getProducts();
      const response = await apiClient.createCheckoutSession(
         cartItems.map(
            (x) =>
               ({
                  ...x,
                  stripePriceId: products.find((p) => p.productId === x.productId)?.stripePriceId
               }) as CartItem
         )
      );
      router.push(response.url);
   };

   const removeItem = async (cartItemId: string) => {
      await removeFromCart(cartItemId);
   };

   return (
      <>
         {cartItems.length > 0 && (
            <>
               <ul style={{ listStyleType: 'none', paddingTop: '20px' }}>
                  {cartItems.map((item) => (
                     <li key={item.productId} style={{ marginBottom: '10px' }}>
                        <CartItemDetail
                           item={item}
                           removeItem={totalOnly ? undefined : removeItem}
                        />
                     </li>
                  ))}
               </ul>

               <Card marginTop="40px">
                  <Stack flexDirection="column" justifyContent="space-between" gap="15px">
                     <Stack justifyContent="space-between">
                        <Stack flexDirection="row" alignItems="flex-end">
                           <Box fontWeight="bold">Subtotal</Box>
                           <Box marginLeft="5px">{`(${cartItems.length} items)`}</Box>
                        </Stack>
                        <Stack flexDirection="row" alignItems="flex-end">
                           <Box fontWeight="bold">{`$${cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)}`}</Box>
                        </Stack>
                     </Stack>
                     <HorizontalLine style={{ marginTop: '5px', borderColor: 'lightgray' }} />
                     <Stack justifyContent="space-between" gap="20px" fontSize="0.9em" color="gray">
                        <Box>Shipping</Box>
                        <Stack flexDirection="row" alignItems="flex-end">
                           <Box>Free</Box>
                        </Stack>
                     </Stack>
                     <Stack justifyContent="space-between" gap="20px">
                        <strong>Taxes</strong>
                        <Stack flexDirection="row" alignItems="flex-end">
                           <Box>Calculated at checkout</Box>
                        </Stack>
                     </Stack>
                     <HorizontalLine style={{ marginTop: '10px', borderColor: 'lightgray' }} />
                     <Stack justifyContent="space-between" gap="20px">
                        <strong>Estimated total</strong>
                        <Stack flexDirection="row" alignItems="flex-end">
                           <Box fontWeight="bold">{`$${cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0).toFixed(2)}`}</Box>
                        </Stack>
                     </Stack>
                     <Stack
                        justifyContent={totalOnly ? 'flex-end' : 'space-between'}
                        alignItems="center"
                        marginTop="20px"
                     >
                        {!totalOnly && (
                           <>
                              <Link href="/products">Continue shopping...</Link>
                              <Button variant="primary" onClick={handleCheckout}>Continue to checkout</Button>
                           </>
                        )}
                     </Stack>
                  </Stack>
               </Card>
            </>
         )}
      </>
   );
}

interface CartItemDetailProps {
   item: CartItem;
   removeItem?: (cartItemId: string) => Promise<void>;
}

export function CartItemDetail({ item, removeItem }: CartItemDetailProps) {
   const { cartItemId, quantity, productName: name, unitPrice: price, imageUrl } = item;

   return (
      cartItemId && (
         <div
            style={{
               display: 'flex',
               flexDirection: 'row',
               justifyContent: 'space-between',
               alignItems: 'center',
               gap: '30px',
               padding: '5px',
               paddingRight: '20px',
               width: '100%',
               border: '1px solid #e0e0e0',
               borderRadius: '8px',
               backgroundColor: 'lightgray'
            }}
         >
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '300px'
               }}
            >
               <Image src={imageUrl} alt={name} width={50} height={50} />
               <span style={{ marginLeft: '20px' }}>{name}</span>
            </div>
            <div style={{ width: '50px' }}>Qty: {quantity}</div>
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  width: '80px'
               }}
            >
               <span>${(price * quantity).toFixed(2)}</span>
               {quantity > 1 && (
                  <span style={{ fontSize: '0.8em' }}>{`($${price.toFixed(2)} ea)`}</span>
               )}
            </div>
            {removeItem && (
               <FaTrash
                  style={{ fontSize: '0.9em', cursor: 'pointer' }}
                  onClick={() => removeItem(cartItemId)}
               />
            )}
         </div>
      )
   );
}

