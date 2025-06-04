import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Admin Dashboard",
  description: "View and manage products",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
      </div>
      
      {/* Add your products table or grid component here */}
      <div className="mt-6">
        {/* Product list will go here */}
      </div>
    </div>
  );
}
