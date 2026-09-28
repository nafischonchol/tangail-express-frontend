import { getProducts } from "@/lib/api/products";
import { getClientLookup } from "@/lib/api/clients";
import { getAccounts } from "@/lib/api/accounts";
import AddSaleClient from "@/app/admin/sales/add/AddSaleClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Add Sale | ${appName}`,
  description: "Real-time checkout interface for quick sales transactions, invoice generation, and customer profile assignment.",
};

export default async function AddSalePage() {
  const [productsRes, clientsRes, accountsRes] = await Promise.all([
    getProducts(),
    getClientLookup(),
    getAccounts(),
  ]);

  const initialProducts = productsRes.success ? productsRes.resources : [];
  const initialCustomers = clientsRes.success ? clientsRes.resources : [];
  const initialAccounts = accountsRes.success ? accountsRes.resources : [];

  return (
    <AddSaleClient 
      initialProducts={initialProducts} 
      initialCustomers={initialCustomers} 
      initialAccounts={initialAccounts}
    />
  );
}
