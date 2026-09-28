import { getBrands } from "@/lib/api/brands";
import BrandsClient from "@/app/admin/cat/brands/BrandsClient";

export const metadata = {
  title: "Brand Management - POS Admin",
  description: "Manage product brand details, metadata, icons, and SEO properties.",
};

export default async function BrandsPage() {
  const response = await getBrands();
  const initialBrands = response.success ? response.resources : [];

  return <BrandsClient initialBrands={initialBrands} />;
}
