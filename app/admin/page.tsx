import DashboardClient from "@/app/admin/DashboardClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohima";

export const metadata = {
  title: `Admin Dashboard | ${appName}`,
  description: "View store analytics, recent sales, top products, and overall business overview.",
};

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
