'use client';

import Image from 'next/image';
import { apiClient, Product, useProducts, CartItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function Products() {
   const { products, loading } = useProducts();

   if (loading) {
      return <div>Loading...</div>;
   }

   return (
      <div>
         <h1 style={{ fontSize: '2em'}}>Products</h1>
         <ul style={{ listStyleType: 'none', paddingTop: '20px' }}>
            {products.map((product) => (
               <li key={product.productId} style={{ marginBottom: '20px' }}>
                  <ProductDetails product={product} />
               </li>
            ))}
         </ul>
      </div>
   );
}

interface ProductProps {
   product: Product;
}

function ProductDetails({ product }: ProductProps) {
   const { name, price, imageUrl } = product;
   const user = useAuth();

   const addToCart = async (product: Product) => {
      await apiClient.addToCart(product.productId, 1, user.userId);
      alert(`${product.name} has been added to your cart!`);
   };

   return (
      <div
         style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '30px',
            padding: '5px',
            paddingRight: '30px',
            width: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: 'gray',
         }}
      >
         <div
            style={{
               display: 'flex',
               flexDirection: 'row',
               justifyContent: 'flex-start',
               alignItems: 'center',
               gap: '50px',
               padding: '5px'
            }}
         >
            <Image src={imageUrl ?? ''} alt={name} width={150} height={150} />
            <div>{name}</div>
         </div>
         <div style={{ paddingLeft: '5px' }}>{`$${price}`}</div>
         <div style={{ paddingLeft: '5px' }}>
            <button
               style={{
                  padding: '10px 20px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
               }}
               onClick={() => addToCart(product)}
            >
               Add to Cart
            </button>
         </div>
      </div>
   );
}
