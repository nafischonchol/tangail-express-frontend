import { Suspense } from "react";
import { getSeoSettings } from "@/lib/api/seo";
import SeoSettingsClient from "@/app/admin/settings/seo/SeoSettingsClient";

export const metadata = {
  title: "SEO & Tracking - POS Admin",
  description: "Configure Webmaster tools, search console verification, and tracking pixels.",
};

export default async function SeoSettingsPage() {
  const response = await getSeoSettings();
  const initialSettings = response.success ? response.resources : null;

  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-400">Loading settings...</div>}>
      <SeoSettingsClient initialSettings={initialSettings} />
    </Suspense>
  );
}
