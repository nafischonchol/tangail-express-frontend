import { getBanners } from "@/lib/api/banners";
import BannersClient from "@/app/admin/banners/BannersClient";

export const metadata = {
  title: "Banner Management - POS Admin",
  description: "Manage website banners, images, and promotional content.",
};

export default async function BannersPage() {
  const response = await getBanners();
  const initialBanners = response.success ? response.resources : [];

  return <BannersClient initialBanners={initialBanners} />;
}
