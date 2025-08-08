import Link from "next/dist/client/link";

export function CommonLinks() {
  return (
    <div className="flex flex-row gap-8">
      <Link href="/" className="nav-link">
        Home
      </Link>
      <Link href="/products" className="nav-link">
        Products
      </Link>
    </div>
  );
}
