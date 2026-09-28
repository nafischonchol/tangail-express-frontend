import { getAdminUsers } from "@/lib/api/adminUsers";
import UsersClient from "@/app/admin/users/list/UsersClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `User Management | ${appName}`,
  description: "Manage your team members and users",
};

export default async function UsersPage() {
  const res = await getAdminUsers();
  const initialUsers = res.success ? res.resources : [];

  return <UsersClient initialUsers={initialUsers} />;
}
