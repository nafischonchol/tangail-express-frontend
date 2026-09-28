"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Client, updateClientStatus } from "@/lib/api/clients";
import { Building2, ChevronDown, ChevronUp, Globe, ShieldCheck, Tag, Info, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface ClientDetailsCardProps {
  client: Client;
}

export default function ClientDetailsCard({ client }: ClientDetailsCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client>(client);

  const details = currentClient.details;

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    setLoading(true);
    try {
      const res = await updateClientStatus(currentClient.id, newStatus);
      if (res.success) {
        toast.success(`Client ${newStatus === "approved" ? "approved" : "rejected"} successfully.`);
        setCurrentClient(prev => ({ ...prev, status: newStatus, is_active: newStatus === "approved" }));
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update status.");
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden border border-slate-200/80 shadow-xs bg-white">
      <CardHeader 
        onClick={() => setIsOpen(prev => !prev)}
        className="flex flex-row items-center justify-between py-4 px-6 cursor-pointer hover:bg-slate-50/60 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-slate-800">Business Registration Details</h3>
              
              {/* Status Badge inside Details Header */}
              {currentClient.status === "pending" ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-800 rounded-full animate-pulse">
                  Pending Approval
                </span>
              ) : currentClient.status === "rejected" ? (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700 rounded-full">
                  Rejected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full">
                  Approved ({currentClient.is_active ? "Active" : "Inactive"})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {details?.company_name ? `${details.company_name} (${details.business_type || 'B2B Client'})` : "View submitted business profile & registration info"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className="flex items-center gap-2 cursor-pointer focus:outline-none group/btn"
        >
          <span className="text-xs font-bold text-indigo-600 group-hover/btn:underline">
            {isOpen ? "Hide Details" : "Show Details"}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-100 group-hover/btn:bg-indigo-50 flex items-center justify-center text-slate-500 group-hover/btn:text-indigo-600 transition-colors">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>
      </CardHeader>

      {isOpen && (
        <CardContent className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/20">
          {!details ? (
            <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Info size={20} className="text-slate-300" />
              No additional business registration details found for this client.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Name</p>
                <p className="text-sm font-semibold text-slate-800">{details.company_name || '-'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Person & Position</p>
                <p className="text-sm font-semibold text-slate-800">
                  {details.contact_name || '-'} {details.position ? `(${details.position})` : ''}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Type</p>
                <p className="text-sm font-medium text-slate-700 capitalize">{details.business_type || '-'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Website / FB Page</p>
                {details.website_or_fb ? (
                  <a 
                    href={details.website_or_fb.startsWith('http') ? details.website_or_fb : `https://${details.website_or_fb}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1 truncate"
                  >
                    <Globe size={13} />
                    {details.website_or_fb}
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 italic">Not provided</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trade License No.</p>
                <p className="text-sm font-medium text-slate-700">{details.trade_license || '-'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Country & Address</p>
                <p className="text-sm font-medium text-slate-700">
                  {details.company_address || '-'} {details.country ? `(${details.country})` : ''}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How heard about us</p>
                <p className="text-sm font-medium text-slate-700 capitalize">{details.hear_about_us || '-'}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">NDA Status</p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>{details.nda_agreed ? "Agreement Accepted" : "Not Agreed"}</span>
                </div>
              </div>

              {details.interested_categories && details.interested_categories.length > 0 && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Interested Categories</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {details.interested_categories.map((cat, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-1">
                        <Tag size={10} /> {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {details.business_introduction && (
                <div className="space-y-1 md:col-span-3 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Business Introduction</p>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed whitespace-pre-wrap">
                    {details.business_introduction}
                  </p>
                </div>
              )}

              {/* Action Buttons inside expanded details section */}
              <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-200/80">
                <span className="text-xs font-bold text-slate-500">Action Status:</span>
                <div className="flex items-center gap-2">
                  {currentClient.status === "pending" || currentClient.status === "rejected" ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleStatusChange("approved")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check size={15} /> Approve Client
                    </button>
                  ) : null}

                  {currentClient.status === "pending" || currentClient.status === "approved" ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleStatusChange("rejected")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X size={15} /> Reject Client
                    </button>
                  ) : null}
                </div>
              </div>

            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
