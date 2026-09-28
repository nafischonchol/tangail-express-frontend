"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, User, ShoppingCart, Percent, Sparkles, Award, Tag, ChevronRight, ChevronDown, Diamond, CheckCircle, HelpCircle, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    import("@/lib/api/categories").then((mod) => {
      mod.getPublicCategories().then((res) => {
        if (res.success && Array.isArray(res.resources)) {
          setCategories(res.resources);
        }
      });
    });
  }, []);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)} className="lg:hidden text-zinc-800 hover:text-[#BA478F] p-1 transition-colors">
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white border-r border-slate-200 z-[110] transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.15)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-[#BA478F] p-1 transition-colors rounded-full hover:bg-[#FDF2F8]">
            <X size={24} />
          </button>
          
          <span className="font-bold text-slate-900 text-base tracking-wider uppercase">
            Menu
          </span>
          
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/cart" className="hover:text-[#BA478F] transition-colors"><ShoppingCart size={22} /></Link>
            <Link href="/login" className="hover:text-[#BA478F] transition-colors"><User size={22} /></Link>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Top Links with Icons */}
          <div className="flex flex-col py-3 border-b border-slate-100">
             <MobileLink href="/" icon={<Home size={20} />} text="Home" onClick={() => setIsOpen(false)} />
             <MobileLink href="/profile" icon={<User size={20} />} text="My page" onClick={() => setIsOpen(false)} />
             <MobileLink href="/catalog" icon={<Diamond size={20} />} text="Products" onClick={() => setIsOpen(false)} highlight />
             <MobileLink href="/new-arrivals" icon={<Sparkles size={20} />} text="New Arrival" onClick={() => setIsOpen(false)} />
             <MobileLink href="/best-sellings" icon={<Award size={20} />} text="Best Sellers" onClick={() => setIsOpen(false)} />
             
             {/* Categories Accordion */}
             <button
               onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
               className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group border-l-2 border-transparent w-full text-left"
             >
               <div className="flex items-center gap-4">
                 <span className={`${isCategoriesOpen ? 'text-[#BA478F]' : 'text-slate-400'} group-hover:text-[#BA478F] transition-colors`}><Layers size={20} /></span>
                 <span className={`font-bold text-[15px] ${isCategoriesOpen ? 'text-slate-900' : 'text-slate-600'} group-hover:text-slate-900 transition-colors`}>Categories</span>
               </div>
               <ChevronDown size={16} className={`text-slate-400 group-hover:text-[#BA478F] transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Categories List (Expanded) */}
             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoriesOpen ? 'max-h-[1000px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
               <div className="flex flex-col pl-14 pr-4 py-1 gap-1 bg-slate-50/50 border-y border-slate-100">
                 {categories.length > 0 ? (
                   categories.map((c: any) => (
                     <CategoryLink key={c.id} text={c.name} href={`/${c.slug || c.id}`} onClick={() => setIsOpen(false)} />
                   ))
                 ) : (
                   <>
                     <CategoryLink text="Skin Care" href="/catalog" onClick={() => setIsOpen(false)} />
                     <CategoryLink text="Makeup Face" href="/catalog" onClick={() => setIsOpen(false)} />
                     <CategoryLink text="Cleansing" href="/catalog" onClick={() => setIsOpen(false)} />
                     <CategoryLink text="Mask" href="/catalog" onClick={() => setIsOpen(false)} />
                     <CategoryLink text="Sun Care" href="/catalog" onClick={() => setIsOpen(false)} />
                   </>
                 )}
               </div>
             </div>

             <MobileLink href="/brands" icon={<Tag size={20} />} text="Brands" onClick={() => setIsOpen(false)} />
          </div>

          {/* Bottom Gray Buttons */}
          <div className="flex items-center gap-2 p-5 bg-slate-50">
             <BottomButton text="Why Us?" href="/why-us" icon={<CheckCircle size={14}/>} />
             <BottomButton text="FAQ" href="/faq" icon={<HelpCircle size={14}/>} />
             <BottomButton text="How to Use" href="/how-to-use" icon={<Sparkles size={14}/>} />
          </div>
        </div>
      </div>
    </>
  );
}

function MobileLink({ href, icon, text, highlight = false, onClick }: { href: string; icon: React.ReactNode; text: string; highlight?: boolean; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 px-6 py-3.5 transition-colors group
        ${highlight ? 'bg-[#FDF2F8]/60 border-l-2 border-[#BA478F]' : 'hover:bg-slate-50 border-l-2 border-transparent'}
      `}
    >
      <span className={`${highlight ? 'text-[#BA478F]' : 'text-slate-400 group-hover:text-[#BA478F] transition-colors'}`}>{icon}</span>
      <span className={`font-bold text-[15px] ${highlight ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900 transition-colors'}`}>{text}</span>
    </Link>
  );
}

function CategoryLink({ text, href, onClick }: { text: string; href?: string; onClick?: () => void }) {
  return (
    <Link href={href || "#"} onClick={onClick} className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-600 hover:text-[#BA478F] hover:bg-slate-50 transition-all font-medium text-[15px] group">
      <span>{text}</span>
      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#BA478F] transition-colors transform group-hover:translate-x-1" />
    </Link>
  );
}

function BottomButton({ text, href, icon }: { text: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex-1 flex flex-col items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 py-3 rounded-xl text-center transition-colors shadow-xs group">
      <span className="text-slate-400 group-hover:text-[#BA478F] transition-colors">{icon}</span>
      <span className="text-[10px] font-bold">{text}</span>
    </Link>
  );
}
