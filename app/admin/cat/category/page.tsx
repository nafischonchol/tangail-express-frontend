import { getCategories } from "@/lib/api/categories";
import CategoryClient from "@/app/admin/cat/category/CategoryClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Categories | ${appName}`,
  description: "View and manage your product categories",
};

export default async function CategoryPage() {
  const res = await getCategories();
  const initialCategories = res.success ? res.resources : [];

  return <CategoryClient initialCategories={initialCategories} />;
}
