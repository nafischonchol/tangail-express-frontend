import { getProducts } from "@/lib/api/products";
import ProductsListClient from "@/app/admin/products/list/ProductsListClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Products | ${appName}`,
  description: "View and manage your catalog of products",
};

export default async function ProductsListPage() {
  const res = await getProducts({ page: 1, per_page: 15 });
  const initialProducts = res.success ? res.resources : [];
  const initialPagination = res.pagination || {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: initialProducts.length,
  };

  return (
    <ProductsListClient
      initialProducts={initialProducts}
      initialPagination={initialPagination}
    />
  );
}
