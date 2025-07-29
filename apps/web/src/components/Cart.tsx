'use client';

import Image from 'next/image';
import { FaTrash } from 'react-icons/fa';
import { CartItem } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/dist/client/link';

export function Cart() {
   const { cartItems, loading, removeFromCart } = useCart();

   if (loading) {
      return <div style={{ fontSize: '2em' }}>Loading...</div>;
   }

   const removeItem = async (cartItemId: string) => {
      await removeFromCart(cartItemId);
   };

   return (
      <div>
         <h1
            style={{ fontSize: '2em' }}
         >{`${cartItems.length > 0 ? 'Items in your cart' : 'Your cart is empty'}`}</h1>
         {cartItems.length > 0 && (
            <ul style={{ listStyleType: 'none', paddingTop: '20px' }}>
               {cartItems.map((item) => (
                  <li key={item.productId} style={{ marginBottom: '20px' }}>
                     <CartItemDetail item={item} removeItem={removeItem} />
                  </li>
               ))}
               <li>
                  <div
                     style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                     }}
                  >
                     <Link href="/products">Continue shopping...</Link>
                     <div
                        style={{
                           display: 'flex',
                           justifyContent: 'flex-end',
                           //padding: '10px 35px',
                           gap: '20px'
                        }}
                     >
                        <strong>Total:</strong>
                        <span>
                           $
                           {cartItems
                              .reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
                              .toFixed(2)}
                        </span>
                     </div>
                  </div>
               </li>
            </ul>
         )}
      </div>
   );
}

interface CartItemDetailProps {
   item: CartItem;
   removeItem: (cartItemId: string) => Promise<void>;
}

function CartItemDetail({ item, removeItem }: CartItemDetailProps) {
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
               backgroundColor: 'gray'
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
            <FaTrash
               style={{ fontSize: '0.9em', cursor: 'pointer' }}
               onClick={() => removeItem(cartItemId)}
            />
         </div>
      )
   );
}
