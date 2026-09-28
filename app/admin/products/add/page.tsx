import { getAttributes } from "@/lib/api/attributes";
import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { getUnits } from "@/lib/api/units";
import AddProductClient from "@/app/admin/products/add/AddProductClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Add Product | ${appName}`,
  description: "Create a new product in your catalog",
};

export default async function AddProductPage() {
  // Fetch metadata lists in parallel on the server
  const [attrsRes, catsRes, brandsRes, unitsRes] = await Promise.all([
    getAttributes(),
    getCategories(),
    getBrands(),
    getUnits(),
  ]);

  const attributes = attrsRes.success ? attrsRes.resources.filter((a) => a.is_active) : [];
  const categories = catsRes.success ? catsRes.resources.filter((c) => c.is_active) : [];
  const brands = brandsRes.success ? brandsRes.resources.filter((b) => b.is_active) : [];
  const units = unitsRes.success ? unitsRes.resources.filter((u) => u.is_active) : [];

  return (
    <AddProductClient
      initialAttributes={attributes}
      initialCategories={categories}
      initialBrands={brands}
      initialUnits={units}
    />
  );
}
