import { getOrders } from "@/lib/api/orders";
import SaleListClient from "@/app/admin/sales/list/SaleListClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Sales History | ${appName}`,
  description: "View and filter sales records, customer invoices, and completed transactions.",
};

export default async function SaleListPage() {
  const res = await getOrders();
  const initialOrders = res.success ? res.resources : [];

  return <SaleListClient initialOrders={initialOrders} />;
}
