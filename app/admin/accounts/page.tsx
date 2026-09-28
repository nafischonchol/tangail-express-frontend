import { PageHeader } from "@/components/ui/PageHeader";
import { getAccounts, Account } from "@/lib/api/accounts";
import AccountsClient from "@/app/admin/accounts/AccountsClient";

export default async function AccountsPage() {
  const res = await getAccounts();
  const accounts: Account[] = res.success ? res.resources : [];

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      <PageHeader
        title="Accounts"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Accounts" }]}
      />

      <AccountsClient initialAccounts={accounts} />
    </div>
  );
}
