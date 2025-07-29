import Link from 'next/dist/client/link';

export function CommonLinks() {
   return (
      <div className="flex flex-row gap-8">
         <Link href="/" className="text-blue-300 hover:underline">
            Home
         </Link>
         <Link href="/products" className="text-blue-300 hover:underline">
            Products
         </Link>
      </div>
   );
}
