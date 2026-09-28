import { getClient, getClientLookup } from "@/lib/api/clients";
import { getOrders } from "@/lib/api/orders";
import ClientListPanel from "@/app/admin/clients/[id]/components/ClientListPanel";
import ClientInfoCard from "@/app/admin/clients/[id]/components/ClientInfoCard";
import ClientDetailsCard from "@/app/admin/clients/[id]/components/ClientDetailsCard";
import ClientTransactionCard from "@/app/admin/clients/[id]/components/ClientTransactionCard";
import { notFound } from "next/navigation";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Client Details | ${appName}`,
  description: "View client information, contact details, and balance.",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const detailRes = await getClient(Number(id));
  if (!detailRes.success || !detailRes.resources) {
    return notFound();
  }
  const client = detailRes.resources;

  const listRes = await getClientLookup();
  const clientsList = listRes.success ? listRes.resources : [];

  const ordersRes = await getOrders(Number(id));
  const clientOrders = ordersRes.success ? ordersRes.resources : [];

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative text-slate-800 bg-slate-50/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="col-span-1 lg:col-span-3">
          <ClientListPanel
            clients={clientsList}
            activeClientId={String(client.id)}
          />
        </div>
        <div className="col-span-1 lg:col-span-9 space-y-6">
          <ClientInfoCard client={client} />
          <ClientDetailsCard client={client} />
          <ClientTransactionCard orders={clientOrders} />
        </div>
      </div>
    </div>
  );
}
