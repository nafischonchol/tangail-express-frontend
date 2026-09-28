import { getCourierSettings } from "@/lib/api/couriers";
import CourierSettingsClient from "@/app/admin/settings/courier/CourierSettingsClient";

export const metadata = {
  title: "Courier Integration Settings - POS Admin",
  description: "Configure third-party delivery services like Pathao and Steadfast to automate logistics.",
};

export default async function CourierSettingsPage() {
  const response = await getCourierSettings();
  const initialSettings = response.success ? response.resources : [];

  return <CourierSettingsClient initialSettings={initialSettings} />;
}
