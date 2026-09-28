import { getProfile } from "@/lib/api/profile";
import ProfileClient from "@/app/admin/profile/ProfileClient";

export const metadata = {
  title: "My Profile - POS Admin",
  description: "Manage your personal profile, contact information, and password.",
};

export default async function ProfilePage() {
  const response = await getProfile();
  const profile = response.success ? response.resources : null;

  return <ProfileClient initialProfile={profile} />;
}
