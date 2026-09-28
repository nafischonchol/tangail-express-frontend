import { getAccounts } from "@/lib/api/accounts";
import TransactionsClient from "@/app/admin/accounts/transactions/TransactionsClient";

export const metadata = {
  title: "Account Transactions | Admin Panel",
  description: "View and manage all financial transactions across accounts.",
};

export default async function TransactionsPage() {
  const accountsRes = await getAccounts();
  const accounts = accountsRes.success ? accountsRes.resources : [];

  return <TransactionsClient initialAccounts={accounts} />;
}
