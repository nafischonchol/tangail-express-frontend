import CouponFormClient from "@/app/admin/coupons/CouponFormClient";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Mohimaa";

export const metadata = {
  title: `Add Coupon | ${appName}`,
  description: "Create a new coupon promotion with discount and eligibility rules",
};

export default function AddCouponPage() {
  return <CouponFormClient mode="create" />;
}
