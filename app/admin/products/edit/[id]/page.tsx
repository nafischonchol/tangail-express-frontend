import { getAttributes } from "@/lib/api/attributes";
import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { getUnits } from "@/lib/api/units";
import { getProductEditPayload } from "@/lib/api/products";
import EditProductClient from "@/app/admin/products/edit/[id]/EditProductClient";
import { notFound } from "next/navigation";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Edit Product | ${appName}`,
  description: "Modify an existing product in your catalog",
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const activeId = resolvedParams.id;

  // Fetch product payload and metadata lists in parallel on the server
  const [productRes, attrsRes, catsRes, brandsRes, unitsRes] = await Promise.all([
    getProductEditPayload(activeId),
    getAttributes(),
    getCategories(),
    getBrands(),
    getUnits(),
  ]);

  // If the product does not exist, return 404
  if (!productRes.success || !productRes.resources) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Product</h2>
        <p className="text-slate-600">The product could not be loaded or you do not have permission to edit it.</p>
        <p className="text-slate-500 text-sm mt-2">API Response: {productRes.message || 'Unknown error'}</p>
      </div>
    );
  }

  const attributes = attrsRes.success ? attrsRes.resources.filter((a) => a.is_active) : [];
  const categories = catsRes.success ? catsRes.resources.filter((c) => c.is_active) : [];
  const brands = brandsRes.success ? brandsRes.resources.filter((b) => b.is_active) : [];
  const units = unitsRes.success ? unitsRes.resources.filter((u) => u.is_active) : [];

  return (
    <EditProductClient
      id={activeId}
      initialProduct={productRes.resources}
      initialAttributes={attributes}
      initialCategories={categories}
      initialBrands={brands}
      initialUnits={units}
    />
  );
}
