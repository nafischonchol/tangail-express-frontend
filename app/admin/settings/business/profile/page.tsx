import { getStoreSetup } from "@/lib/api/storeSetup";
import BusinessProfileClient from "@/app/admin/settings/business/profile/BusinessProfileClient";

export const metadata = {
  title: "Business Profile - POS Admin",
  description: "Manage your store branding, address, and social links.",
};

export default async function BusinessProfilePage() {
  const response = await getStoreSetup();
  const initialData = response.success ? response.resources : null;

  return <BusinessProfileClient initialStoreSetup={initialData} />;
}
