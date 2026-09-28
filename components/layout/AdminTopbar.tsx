"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sun, Bell, Menu, User, LogOut, Settings, ChevronDown, Store, Plus } from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/api/auth";
import { getProfile, Profile } from "@/lib/api/profile";

interface TopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: TopbarProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile().then(res => {
      if (res.success && res.resources) setProfile(res.resources);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 shadow-[0_2px_12px_rgba(0,0,0,0.015)] relative">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-500 hover:text-indigo-600 p-2 -ml-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Menu size={22} />
        </button>

        <label className="relative w-full max-w-md hidden sm:flex items-center group cursor-text">
          <Search className="absolute left-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search products, orders..." 
            className="w-full pl-11 pr-4 py-2 bg-slate-50/50 border border-slate-200/85 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </label>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Add Sale Button */}
        <Link href="/admin/sales/add" className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer">
          <Plus size={16} />
          <span className="hidden sm:inline">Add Sale</span>
        </Link>

        {/* Mobile Search Icon */}
        <button className="sm:hidden text-slate-500 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <Search size={20} />
        </button>

        <button className="text-slate-500 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <Sun size={20} />
        </button>
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            className="text-slate-500 hover:text-indigo-600 p-2 rounded-xl hover:bg-slate-50 transition-colors relative cursor-pointer"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full ring-2 ring-white"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100/80 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                <button className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">Mark all as read</button>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Store size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Inventory Alert</span>: "Nike Pegasus" is running low on stock (2 remaining)</p>
                    <p className="text-xs text-slate-400 mt-1">5 minutes ago</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2 ml-auto"></div>
                </div>

                <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">New Sale</span>: Order #1084 completed successfully ($120.00)</p>
                    <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                  </div>
                </div>

                <div className="px-4 py-3 hover:bg-slate-50/70 transition-colors cursor-pointer flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Settings size={14} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-800">Catalog Updated</span>: 3 new categories auto-approved</p>
                    <p className="text-xs text-slate-400 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-1 sm:ml-4" ref={profileRef}>
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">{profile?.name || 'User'}</span>
              <span className="text-xs text-slate-400 mt-1">{profile?.email || ''}</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-100 transition-all shrink-0">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 mb-1 sm:hidden">
                <p className="text-sm font-semibold text-slate-800">{profile?.name || 'User'}</p>
                <p className="text-xs text-slate-400 truncate">{profile?.email || ''}</p>
              </div>
              
              <Link href="/admin/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer">
                <User size={16} />
                Profile Settings
              </Link>
              
              <Link href="/admin/settings/business/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer">
                <Settings size={16} />
                Store Settings
              </Link>
              
              <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                <button 
                  onClick={() => logoutUser()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
