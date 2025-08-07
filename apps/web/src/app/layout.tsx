import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { Nav } from '@/components/Nav';
import { CommonLinks } from '@/components/CommonLinks';
import Link from 'next/link';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin']
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin']
});

export const metadata: Metadata = {
   title: 'E-Commerce App',
   description: 'E-Commerce Application built with Next.js and Express'
};

// <div
//    style={{
//       fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
//       display: 'grid',
//       //gridTemplateRows: '20px 1fr 20px',
//       alignItems: 'center',
//       justifyItems: 'center',
//       //minHeight: '100vh',
//       padding: '2rem',
//       paddingTop: '5rem',
//       paddingBottom: '5rem',
//       gap: '3rem'
//    }}
// >

export default function RootLayout({
   children
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <AuthProvider>
               <CartProvider>
                  <>
                     <Nav />
                     <main
                        style={{
                           flex: '1',
                           marginTop: '0px',
                           marginBottom: '0px',
                           display: 'flex',
                           justifyContent: 'center',
                           alignItems: 'flex-start'
                        }}
                     >
                        <div
                           style={{
                              maxWidth: '1200px',
                              width: '100%',
                              padding: '0 20px',
                              boxSizing: 'border-box'
                           }}
                        >
                           <div
                              style={{
                                 display: 'grid',
                                 alignItems: 'center',
                                 justifyItems: 'center',
                                 padding: '2rem',
                                 paddingTop: '5rem',
                                 paddingBottom: '5rem',
                                 gap: '3rem'
                              }}
                           >
                              {children}
                           </div>
                        </div>
                     </main>

                     <footer
                        style={{
                           textAlign: 'center',
                           paddingLeft: '50px',
                           paddingRight: '50px'
                        }}
                     >
                        <div
                           style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '20px'
                           }}
                        >
                           <CommonLinks />
                           <Link href="/about" className="text-blue-500 hover:underline">
                              About Us
                           </Link>
                           <Link href="/contact" className="text-blue-500 hover:underline">
                              Contact
                           </Link>
                           <Link href="/privacy" className="text-blue-500 hover:underline">
                              Privacy Policy
                           </Link>
                        </div>
                        <div style={{ padding: '20px' }}>
                           {`© ${new Date().getFullYear()} E-commerce Platform. All rights reserved.`}
                        </div>
                     </footer>
                  </>
               </CartProvider>
            </AuthProvider>
         </body>
      </html>
   );
}
