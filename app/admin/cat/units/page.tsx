import { getUnits } from "@/lib/api/units";
import UnitsClient from "@/app/admin/cat/units/UnitsClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Unit Management | ${appName}`,
  description: "Manage product measurement units, active status, and abbreviations.",
};

export default async function UnitsPage() {
  const response = await getUnits();
  const initialUnits = response.success ? response.resources : [];

  return <UnitsClient initialUnits={initialUnits} />;
}
