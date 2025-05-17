/* components/Navbar.tsx */
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-green-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <Link href="/">ICN_FREEZE</Link>
        <div>
          <Link href="/cart" className="mr-4">
            Cart
          </Link>
          <Link href="/profile">Profile</Link>
        </div>
      </div>
    </nav>
  );
}
