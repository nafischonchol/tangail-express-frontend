import { getOrder, getOrderLookup } from "@/lib/api/orders";
import SaleDetailClient from "@/app/admin/sales/[id]/SaleDetailClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Sale Details | ${appName}`,
  description: "View sale details, items, and payment information.",
};

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getOrder(Number(id));
  const order = res.success ? res.resources : null;

  const listRes = await getOrderLookup();
  const ordersList = listRes.success ? listRes.resources : [];

  return <SaleDetailClient order={order} orders={ordersList} />;
}
