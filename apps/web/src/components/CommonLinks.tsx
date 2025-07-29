import Link from 'next/dist/client/link';

export function CommonLinks() {
   return (
      <div className="flex flex-row gap-8">
         <Link href="/" className="text-blue-600 hover:underline">
            Home
         </Link>
         <Link href="/products" className="text-blue-600 hover:underline">
            Products
         </Link>
         <Link href="/about" className="text-blue-600 hover:underline">
            About Us
         </Link>
         <Link href="/contact" className="text-blue-600 hover:underline">
            Contact
         </Link>
         <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
         </Link>
      </div>
   );
}
