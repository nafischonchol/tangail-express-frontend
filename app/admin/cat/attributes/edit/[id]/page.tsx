import { getAttribute } from "@/lib/api/attributes";
import { notFound } from "next/navigation";
import EditAttributeClient from "./EditAttributeClient";

export const metadata = {
  title: "Edit Attribute - POS Admin",
  description: "Edit product attribute options, swatches, and configuration.",
};

interface EditAttributePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAttributePage({ params }: EditAttributePageProps) {
  const { id } = await params;
  const response = await getAttribute(id);

  if (!response.success || !response.resources) {
    notFound();
  }

  return <EditAttributeClient initialAttribute={response.resources} />;
}
