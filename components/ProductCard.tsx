// components/ProductCard.tsx
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl?: string | null;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg transition">
      <Link href={`/products/${product.id}`}>
        <img
          src={product.imageUrl || "/images/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover mb-2"
        />
        <h2 className="font-semibold text-lg">{product.name}</h2>
        <p className="text-green-700 mt-1">{product.price} ฿</p>
      </Link>
    </div>
  );
}
