import { getCoupon } from "@/lib/api/coupons";
import CouponFormClient from "@/app/admin/coupons/CouponFormClient";
import { notFound } from "next/navigation";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Edit Coupon | ${appName}`,
  description: "Update coupon promotion discount and eligibility rules",
};

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const couponId = parseInt(resolvedParams.id, 10);

  if (isNaN(couponId)) {
    notFound();
  }

  const res = await getCoupon(couponId);
  const coupon = res.success ? res.resources : null;

  if (!coupon) {
    notFound();
  }

  return <CouponFormClient mode="edit" initialCoupon={coupon} />;
}
