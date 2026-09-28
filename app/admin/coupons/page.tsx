import { getCoupons } from "@/lib/api/coupons";
import CouponsClient from "@/app/admin/coupons/CouponsClient";

export const dynamic = "force-dynamic";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Coupons & Discounts | ${appName}`,
  description: "Create and manage promo codes and customer discounts",
};

export default async function CouponsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    per_page?: string;
    search?: string;
    status?: string;
    type?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams?.page ? parseInt(resolvedParams.page, 10) : 1;
  const perPage = resolvedParams?.per_page ? parseInt(resolvedParams.per_page, 10) : 15;
  const search = resolvedParams?.search || "";
  const status = resolvedParams?.status || "all";
  const type = resolvedParams?.type || "all";

  const res = await getCoupons({
    page,
    per_page: perPage,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    type: type !== "all" ? type : undefined,
  });

  const coupons = res.resources?.coupons || [];
  const pagination = res.pagination || res.resources?.pagination || {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  };
  const stats = res.resources?.stats || {
    total_coupons: 0,
    active_coupons: 0,
    total_redemptions: 0,
    total_discount_given: 0,
  };

  return (
    <CouponsClient
      initialCoupons={coupons}
      initialPagination={pagination}
      initialStats={stats}
    />
  );
}
