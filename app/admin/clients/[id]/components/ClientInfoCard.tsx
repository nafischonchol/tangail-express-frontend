"use client";

import { Card } from "@/components/ui/Card";
import { Client } from "@/lib/api/clients";
import { User, Phone, Mail, MapPin, Building, Briefcase } from "lucide-react";

interface ClientInfoCardProps {
  client: Client;
}

export default function ClientInfoCard({ client }: ClientInfoCardProps) {
  const details = client.details;

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl uppercase flex-shrink-0">
                {client.name.substring(0, 2)}
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1 text-sm">
                  {client.username && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User size={14} className="text-slate-400" />
                      <span className="font-semibold text-slate-900">@{client.username}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone size={14} className="text-slate-400" />
                    <span>{client.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{client.address || '-'}</span>
                  </div>

                  {details?.company_name && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building size={14} className="text-slate-400" />
                      <span>Company: <strong>{details.company_name}</strong></span>
                    </div>
                  )}
                  {details?.position && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      <span>Title: <strong>{details.position}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Balance */}
          <div className="flex flex-col items-end gap-1 min-w-[150px]">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Balance</span>
            <p className="text-xl font-extrabold text-slate-900">
              ৳ {client.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
