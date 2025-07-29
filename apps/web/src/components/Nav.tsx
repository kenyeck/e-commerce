'use client';

import { apiClient, useAuth } from '@/lib/api';
import Link from 'next/link';
import { FaShoppingCart } from 'react-icons/fa';
import { CommonLinks } from './CommonLinks';

export function Nav() {
   const { isAuthenticated } = useAuth();

   const logout = async () => {
      await apiClient.logout();
   };

   return (
      <nav
         style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
            background: 'bg',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            position: 'fixed',
            zIndex: 2,
            paddingLeft: '50px',
            paddingRight: '50px'
         }}
      >
         <Link
            href="https://localhost:3000"
            style={{
               textDecoration: 'none',
               color: 'inherit',
               fontSize: '1.5em',
               fontWeight: 'bold'
            }}
         >
            E-Commerce
         </Link>
         <div
            style={{
               display: 'flex',
               flexDirection: 'row',
               justifyContent: 'flex-end',
               alignItems: 'center',
               gap: '18px'
            }}
         >
            <CommonLinks />
            {!isAuthenticated ? (
               <Link href="/login" className="text-blue-600 hover:underline">
                  Login
               </Link>
            ) : (
               <>
                  <Link href="/profile" className="text-blue-600 hover:underline">
                     Profile
                  </Link>
                  <button onClick={logout} className="text-blue-600 hover:underline">
                     Logout
                  </button>
               </>
            )}
            <Link href="/cart" className="text-blue-600 hover:underline">
               <FaShoppingCart />
            </Link>
         </div>
      </nav>
   );
}
