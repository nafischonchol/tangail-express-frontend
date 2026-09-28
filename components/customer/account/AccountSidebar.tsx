"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard,
  User, 
  Package, 
  MapPin, 
  LogOut 
} from "lucide-react";
import toast from "react-hot-toast";

interface AccountSidebarProps {
  user?: {
    name?: string;
    phone?: string;
    avatar?: string | null;
  } | null;
}

export function AccountSidebar({ user }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { name: "Dashboard", href: "/account", icon: LayoutDashboard },
    { name: "My Orders", href: "/account/orders", icon: Package },
    { name: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { name: "Profile & Security", href: "/account/profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    window.dispatchEvent(new Event("customer-auth-changed"));
    toast.success("Logged out successfully", {
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
    });
    router.push("/login");
  };

  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 sticky top-24 shadow-xs">
        {/* User Brief */}
        <div className="mb-5 pb-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center text-[#BA478F] font-bold text-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-zinc-900 truncate">
              {user?.name || "Customer Account"}
            </h3>
            <p className="text-[11px] text-zinc-500 truncate">{user?.phone || ""}</p>
          </div>
        </div>
        
        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold ${
                  isActive 
                    ? "bg-[#FDF2F8] text-[#BA478F] font-bold border border-[#FBCFE8]" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent"
                }`}
              >
                <Icon size={16} className={isActive ? "text-[#BA478F]" : "text-zinc-400"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-3 mt-2 border-t border-zinc-100">
            <button 
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
