import { getAttributes } from "@/lib/api/attributes";
import AttributesClient from "@/app/admin/cat/attributes/AttributesClient";

export const metadata = {
  title: "Attribute Management - POS Admin",
  description: "Manage product variant attributes such as color, size, and weight options.",
};

export default async function AttributesPage() {
  const response = await getAttributes();
  const initialAttributes = response.success ? response.resources : [];

  return <AttributesClient initialAttributes={initialAttributes} />;
}
