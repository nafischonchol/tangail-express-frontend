import { getClients } from "@/lib/api/clients";
import ClientsClient from "@/app/admin/clients/ClientsClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Client Management | ${appName}`,
  description: "Manage your customers and suppliers",
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; per_page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams?.page ? parseInt(resolvedParams.page, 10) : 1;
  const perPage = resolvedParams?.per_page ? parseInt(resolvedParams.per_page, 10) : 20;

  const res = await getClients(page, perPage);
  const initialClients = res.success ? res.resources : [];
  const initialPagination = res.pagination;

  return (
    <ClientsClient
      initialClients={initialClients}
      initialPagination={initialPagination}
    />
  );
}
