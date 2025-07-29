'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { CommonLinks } from './CommonLinks';

export function Nav() {
   const { isAuthenticated, logout } = useAuth();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   const onLogout = async () => {
      await logout();
      setIsDropdownOpen(false);
   };

   const toggleDropdown = () => {
      setIsDropdownOpen(!isDropdownOpen);
   };

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   return (
      <nav
         style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
            background: 'black',
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
            <div ref={dropdownRef} style={{ position: 'relative' }}>
               <button
                  onClick={toggleDropdown}
                  style={{
                     background: 'none',
                     border: 'none',
                     color: '#93c5fd',
                     fontSize: '1.2em',
                     cursor: 'pointer',
                     padding: '8px',
                     borderRadius: '4px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                  }}
                  onMouseEnter={(e) =>
                     (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
               >
                  <FaUser />
               </button>
               {isDropdownOpen && (
                  <div
                     style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        minWidth: '120px',
                        zIndex: 1000,
                        marginTop: '4px'
                     }}
                  >
                     {!isAuthenticated ? (
                        <Link
                           href="/login"
                           style={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#374151',
                              textDecoration: 'none',
                              fontSize: '14px',
                              borderRadius: '8px'
                           }}
                           onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e5e7eb';
                              e.currentTarget.style.borderRadius = '8px';
                           }}
                           onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                           }}
                           onClick={() => setIsDropdownOpen(false)}
                        >
                           Login
                        </Link>
                     ) : (
                        <>
                           <Link
                              href="/profile"
                              style={{
                                 display: 'block',
                                 padding: '12px 16px',
                                 color: '#374151',
                                 textDecoration: 'none',
                                 fontSize: '14px',
                                 borderBottom: '1px solid #f3f4f6',
                                 borderRadius: '8px 8px 0 0'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.backgroundColor = '#e5e7eb';
                                 e.currentTarget.style.borderRadius = '8px 8px 0 0';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={() => setIsDropdownOpen(false)}
                           >
                              Profile
                           </Link>
                           <button
                              onClick={onLogout}
                              style={{
                                 width: '100%',
                                 padding: '12px 16px',
                                 color: '#374151',
                                 backgroundColor: 'transparent',
                                 border: 'none',
                                 textAlign: 'left',
                                 fontSize: '14px',
                                 cursor: 'pointer',
                                 borderRadius: '0 0 8px 8px'
                              }}
                              onMouseEnter={(e) => {
                                 e.currentTarget.style.backgroundColor = '#e5e7eb';
                                 e.currentTarget.style.borderRadius = '0 0 8px 8px';
                              }}
                              onMouseLeave={(e) => {
                                 e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                           >
                              Logout
                           </button>
                        </>
                     )}
                  </div>
               )}
            </div>
            <Link href="/cart" className="text-blue-300 hover:underline">
               <FaShoppingCart />
            </Link>
         </div>
      </nav>
   );
}
