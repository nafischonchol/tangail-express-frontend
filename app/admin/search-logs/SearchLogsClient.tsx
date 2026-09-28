"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Search,
  TrendingUp,
  AlertTriangle,
  SpellCheck,
  ListFilter,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  MousePointerClick,
  FileText,
  Calendar,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import {
  SearchSummary,
  TrendingSearchItem,
  NotFoundSearchItem,
  TypoSuggestionItem,
  SearchLogEntry,
  getSearchSummary,
  getTrendingSearches,
  getNotFoundSearches,
  getTypoSuggestions,
  getSearchLogs,
  clearSearchLogs,
} from "@/lib/api/searchLogs";

interface SearchLogsClientProps {
  initialSummary: SearchSummary | null;
  initialTrending: TrendingSearchItem[];
  initialNotFound: NotFoundSearchItem[];
  initialTypos: TypoSuggestionItem[];
  initialDays?: number;
}

export type TabType = "trending" | "not_found" | "typos" | "logs";

function parseTabParam(tabParam: string | null): TabType {
  if (!tabParam) return "trending";
  const normalized = tabParam.toLowerCase().trim();
  if (
    normalized === "not_found" ||
    normalized === "not-found" ||
    normalized === "notfound" ||
    normalized === "zero" ||
    normalized === "zero_results" ||
    normalized === "zero-results" ||
    normalized === "0-results" ||
    normalized === "0results"
  ) {
    return "not_found";
  }
  if (
    normalized === "typos" ||
    normalized === "typo" ||
    normalized === "spelling" ||
    normalized === "spellcheck"
  ) {
    return "typos";
  }
  if (
    normalized === "logs" ||
    normalized === "raw" ||
    normalized === "raw_logs" ||
    normalized === "raw-logs" ||
    normalized === "raw_queries" ||
    normalized === "raw-queries" ||
    normalized === "queries" ||
    normalized === "rawqueries" ||
    normalized === "rawlogs"
  ) {
    return "logs";
  }
  return "trending";
}

export default function SearchLogsClient({
  initialSummary,
  initialTrending,
  initialNotFound,
  initialTypos,
  initialDays = 7,
}: SearchLogsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabType>(() => parseTabParam(searchParams.get("tab")));
  const [periodDays, setPeriodDays] = useState<number>(() => {
    const daysParam = searchParams.get("days") || searchParams.get("period");
    if (daysParam) {
      const parsed = parseInt(daysParam, 10);
      if (!isNaN(parsed) && [7, 14, 30, 90].includes(parsed)) return parsed;
    }
    return initialDays;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state when URL searchParams change (browser back/forward or external links)
  useEffect(() => {
    const currentTabInUrl = parseTabParam(searchParams.get("tab"));
    if (currentTabInUrl !== activeTab) {
      setActiveTab(currentTabInUrl);
    }
    const daysParam = searchParams.get("days") || searchParams.get("period");
    if (daysParam) {
      const parsed = parseInt(daysParam, 10);
      if (!isNaN(parsed) && [7, 14, 30, 90].includes(parsed) && parsed !== periodDays) {
        setPeriodDays(parsed);
      }
    }
  }, [searchParams]);

  // Tab change handler that updates URL query param
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/search-logs?${params.toString()}`, { scroll: false });
  };

  // Period change handler that updates URL query param
  const handlePeriodChange = (days: number) => {
    setPeriodDays(days);
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", days.toString());
    router.replace(`/admin/search-logs?${params.toString()}`, { scroll: false });
  };

  // Data states
  const [summary, setSummary] = useState<SearchSummary | null>(initialSummary);
  const [trending, setTrending] = useState<TrendingSearchItem[]>(initialTrending);
  const [notFound, setNotFound] = useState<NotFoundSearchItem[]>(initialNotFound);
  const [typos, setTypos] = useState<TypoSuggestionItem[]>(initialTypos);

  // Raw logs state
  const [logs, setLogs] = useState<SearchLogEntry[]>([]);
  const [logsPagination, setLogsPagination] = useState<{
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [logsPage, setLogsPage] = useState<number>(1);
  const [logsSearchText, setLogsSearchText] = useState<string>("");
  const [debouncedLogsSearch, setDebouncedLogsSearch] = useState<string>("");
  const [logsOnlyZero, setLogsOnlyZero] = useState<boolean>(false);
  const [logsSource, setLogsSource] = useState<string>("");

  // Notification / Toast
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [purgeDays, setPurgeDays] = useState<number>(60);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showNotification("success", `Copied to clipboard: "${text}"`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Debounce search input for raw logs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLogsSearch(logsSearchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [logsSearchText]);

  // Fetch summary and active tab data when period changes
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sumRes, trendRes, notFoundRes, typosRes] = await Promise.all([
        getSearchSummary(periodDays),
        getTrendingSearches(periodDays, 50),
        getNotFoundSearches(periodDays, 50),
        getTypoSuggestions(periodDays),
      ]);

      if (sumRes.success) setSummary(sumRes.resources);
      if (trendRes.success) setTrending(trendRes.resources || []);
      if (notFoundRes.success) setNotFound(notFoundRes.resources || []);
      if (typosRes.success) setTypos(typosRes.resources || []);
    } catch (err) {
      console.error("Failed to refresh search analytics:", err);
      showNotification("error", "Failed to refresh search analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [periodDays]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Fetch raw logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSearchLogs({
        page: logsPage,
        per_page: 20,
        search_text: debouncedLogsSearch || undefined,
        only_zero_results: logsOnlyZero || undefined,
        source: logsSource || undefined,
      });

      if (res.success) {
        setLogs(res.resources || []);
        if (res.pagination) {
          setLogsPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to fetch search logs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [logsPage, debouncedLogsSearch, logsOnlyZero, logsSource]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs();
    }
  }, [activeTab, fetchLogs]);

  const handlePurgeLogs = async () => {
    setIsPurging(true);
    try {
      const res = await clearSearchLogs(purgeDays);
      if (res.success) {
        showNotification("success", `Purged ${res.resources?.deleted_count || 0} old search logs.`);
        setShowPurgeModal(false);
        refreshData();
        if (activeTab === "logs") fetchLogs();
      } else {
        showNotification("error", res.message || "Failed to purge logs.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", "Error purging search logs.");
    } finally {
      setIsPurging(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-100 text-emerald-800"
              : "bg-rose-50/90 border-rose-100 text-rose-800"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600"
            }`}
          >
            {notification.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{notification.type === "success" ? "Success" : "Error"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Search size={24} className="text-[#BA478F]" />
            Search Logs & Audit Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor search traffic, zero-result demands, visitor typos, and click conversions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Calendar size={13} className="text-slate-400 ml-1.5 mr-0.5" />
            {[
              { label: "7 Days", value: 7 },
              { label: "14 Days", value: 14 },
              { label: "30 Days", value: 30 },
              { label: "90 Days", value: 90 },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => handlePeriodChange(p.value)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  periodDays === p.value
                    ? "bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="h-8 gap-1.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin text-[#BA478F]" : "text-slate-500"} />
            Refresh
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowPurgeModal(true)}
            className="h-8 gap-1.5 text-xs border border-rose-200 shadow-xs"
          >
            <Trash2 size={13} />
            Purge Logs
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Searches</span>
              <Search size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {summary?.total_searches?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Last {periodDays} days</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Unique Terms</span>
              <ListFilter size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {summary?.unique_queries?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Distinct queries</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>0-Results Rate</span>
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span
                className={`text-xl font-bold ${
                  (summary?.zero_results_rate || 0) > 20 ? "text-amber-600" : "text-slate-800"
                }`}
              >
                {summary?.zero_results_rate ?? 0}%
              </span>
              <span className="text-xs text-slate-400">({summary?.zero_result_searches ?? 0})</span>
            </div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">Missed demand</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Result Clicks</span>
              <MousePointerClick size={14} className="text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {summary?.total_clicks?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Product visits</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Search CTR</span>
              <TrendingUp size={14} className="text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-indigo-600 mt-1">
              {summary?.ctr ?? 0}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Clicks / Searches</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Unique Visitors</span>
              <Users size={14} className="text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {summary?.unique_visitors?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Via visitor_id</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
        {/* Card Header with Tabs & Controls */}
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 px-6 bg-slate-50/30 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {activeTab === "trending" && <TrendingUp className="w-5 h-5 text-[#BA478F]" />}
              {activeTab === "not_found" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {activeTab === "typos" && <SpellCheck className="w-5 h-5 text-indigo-500" />}
              {activeTab === "logs" && <FileText className="w-5 h-5 text-slate-600" />}

              <span>
                {activeTab === "trending" && "Trending Searches"}
                {activeTab === "not_found" && "Search But Not Found (0 Results)"}
                {activeTab === "typos" && "Typo & Spelling Suggestions"}
                {activeTab === "logs" && "Raw Search Logs Stream"}
              </span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === "trending" && `Top search queries and user click behavior over the last ${periodDays} days`}
              {activeTab === "not_found" && "Customer search queries that yielded zero results — opportunities for inventory & keyword tags"}
              {activeTab === "typos" && "Zero-result queries with close phonetic and edit-distance matches against catalog products"}
              {activeTab === "logs" && "Chronological stream of search events, visitor sessions, and clicked products"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status / Feature Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => handleTabChange("trending")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "trending"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Trending ({trending.length})
              </button>

              <button
                onClick={() => handleTabChange("not_found")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "not_found"
                    ? "bg-white text-amber-700 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                0 Results ({notFound.length})
              </button>

              <button
                onClick={() => handleTabChange("typos")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "typos"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Typos ({typos.length})
              </button>

              <button
                onClick={() => handleTabChange("logs")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Raw Logs
              </button>
            </div>
          </div>
        </CardHeader>

        {/* Tab 1: Trending Searches Table */}
        {activeTab === "trending" && (
          <div className="p-0">
            {trending.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No search queries recorded in the last {periodDays} days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6 w-14 text-center">#</th>
                      <th className="py-3.5 px-6">Search Keyword</th>
                      <th className="py-3.5 px-6 text-right">Searches</th>
                      <th className="py-3.5 px-6 text-right">Avg Results</th>
                      <th className="py-3.5 px-6 text-right">0-Results</th>
                      <th className="py-3.5 px-6 text-right">Clicks</th>
                      <th className="py-3.5 px-6 text-right">CTR</th>
                      <th className="py-3.5 px-6 text-right">Unique Visitors</th>
                      <th className="py-3.5 px-6 text-right">Last Searched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trending.map((item, idx) => (
                      <tr key={item.normalized_query} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6 text-center font-mono text-slate-400 font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">
                              {item.normalized_query}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.normalized_query)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                              title="Copy keyword"
                            >
                              {copiedText === item.normalized_query ? (
                                <Check size={13} className="text-emerald-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800 text-xs">
                          {item.search_count}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-600 text-xs">
                          {item.avg_results}
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          {item.zero_results_count > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500" />
                              {item.zero_results_count}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-700 text-xs font-semibold">
                          {item.clicks_count}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-xs">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                              item.ctr_percentage >= 20
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                : item.ctr_percentage > 0
                                ? "bg-slate-100 border border-slate-200 text-slate-700"
                                : "text-slate-400"
                            }`}
                          >
                            {item.ctr_percentage}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-600 text-xs">
                          {item.unique_visitors}
                        </td>
                        <td className="py-3.5 px-6 text-right text-slate-400 text-xs font-mono">
                          {formatDate(item.last_searched_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Search But Not Found (0 Results) Table */}
        {activeTab === "not_found" && (
          <div className="p-0">
            <div className="bg-amber-50/50 border-b border-amber-100/80 px-6 py-3 text-xs text-amber-900 flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Inventory / Tagging Opportunities:</strong> কাস্টমাররা যেসব কিওয়ার্ড সার্চ করে কোনো রেজাল্ট পাননি।
              </span>
            </div>

            {notFound.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                🎉 No missed searches recorded in the last {periodDays} days.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6 w-14 text-center">#</th>
                      <th className="py-3.5 px-6">Missed Search Term</th>
                      <th className="py-3.5 px-6 text-right">Missed Search Count</th>
                      <th className="py-3.5 px-6 text-right">Unique Visitors</th>
                      <th className="py-3.5 px-6 text-right">Last Attempted</th>
                      <th className="py-3.5 px-6 text-center w-36">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {notFound.map((item, idx) => (
                      <tr key={item.normalized_query} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6 text-center font-mono text-slate-400 font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-800 text-sm">
                            {item.normalized_query}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-rose-50 border-rose-100 text-rose-700 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-rose-500" />
                            {item.missed_count} times
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-600 text-xs">
                          {item.unique_visitors} visitors
                        </td>
                        <td className="py-3.5 px-6 text-right text-slate-400 text-xs font-mono">
                          {formatDate(item.last_searched_at)}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.normalized_query)}
                            className="h-7 px-2.5 text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Copy size={12} />
                            <span>Copy Term</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Typo & Spelling Suggestions */}
        {activeTab === "typos" && (
          <div className="p-0">
            <div className="bg-indigo-50/40 border-b border-indigo-100/70 px-6 py-3 text-xs text-indigo-950 flex items-center gap-2">
              <SpellCheck size={15} className="text-indigo-600 shrink-0" />
              <span>
                <strong>Spelling & Phonetic Matches:</strong> ০-রেজাল্ট হওয়া কুয়েরিগুলোকে ক্যাটালগ আইটেমের সাথে Levenshtein Distance দিয়ে বিশ্লেষণ করা হয়েছে।
              </span>
            </div>

            {typos.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No obvious spelling mistakes detected among recent zero-result searches.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6 w-14 text-center">#</th>
                      <th className="py-3.5 px-6">User Typed (Typo)</th>
                      <th className="py-3.5 px-6 text-right">Searches</th>
                      <th className="py-3.5 px-6">Suggested Real Item</th>
                      <th className="py-3.5 px-6">Target Type</th>
                      <th className="py-3.5 px-6 text-right">Similarity Score</th>
                      <th className="py-3.5 px-6 text-right">Edit Distance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {typos.map((item, idx) => (
                      <tr key={item.typo_query} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6 text-center font-mono text-slate-400 font-medium text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 font-mono text-xs">
                            {item.typo_query}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-800 text-xs">
                          {item.search_count}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="font-semibold text-slate-900 text-sm">
                            {item.suggested_target}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-700">
                            {item.target_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-600 text-xs">
                          {item.similarity_score}%
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-slate-500 text-xs">
                          {item.distance} char diff
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Raw Logs Stream */}
        {activeTab === "logs" && (
          <div className="p-0">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search logs, visitor ID, IP..."
                    value={logsSearchText}
                    onChange={(e) => {
                      setLogsSearchText(e.target.value);
                      setLogsPage(1);
                    }}
                    className="pl-9 h-9 text-xs bg-white"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none bg-white px-3 py-2 rounded-xl border border-slate-200/80 shadow-xs">
                  <input
                    type="checkbox"
                    checked={logsOnlyZero}
                    onChange={(e) => {
                      setLogsOnlyZero(e.target.checked);
                      setLogsPage(1);
                    }}
                    className="rounded border-slate-300 text-[#BA478F] focus:ring-0 cursor-pointer"
                  />
                  <span>0 Results Only</span>
                </label>

                <select
                  value={logsSource}
                  onChange={(e) => {
                    setLogsSource(e.target.value);
                    setLogsPage(1);
                  }}
                  className="h-9 px-3 text-xs font-medium text-slate-900 bg-white border border-slate-200/80 rounded-xl focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="" className="text-slate-900 bg-white">All Sources</option>
                  <option value="autocomplete" className="text-slate-900 bg-white">Autocomplete</option>
                  <option value="catalog_page" className="text-slate-900 bg-white">Catalog Page</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {logsPagination ? `Showing ${logs.length} of ${logsPagination.total} logs` : ""}
              </div>
            </div>

            {/* Logs Table */}
            {logs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No logs matching your current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6 w-14 text-center">ID</th>
                      <th className="py-3.5 px-6">Raw Query</th>
                      <th className="py-3.5 px-6 text-center">Results</th>
                      <th className="py-3.5 px-6">Source</th>
                      <th className="py-3.5 px-6">Visitor ID</th>
                      <th className="py-3.5 px-6">User / Client</th>
                      <th className="py-3.5 px-6">Clicked Product</th>
                      <th className="py-3.5 px-6">IP Address</th>
                      <th className="py-3.5 px-6 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6 text-center font-mono text-slate-400 text-xs">
                          {log.id}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900 text-sm">{log.query}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            norm: {log.normalized_query}
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          {log.results_count === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border bg-rose-50 border-rose-100 text-rose-700 font-mono">
                              0
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border bg-slate-100 border-slate-200 text-slate-700 font-mono">
                              {log.results_count}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md">
                            {log.source}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-600 text-xs">
                          {log.visitor_id ? (
                            <div className="flex items-center gap-1.5">
                              <span title={log.visitor_id}>
                                {log.visitor_id.length > 14
                                  ? `${log.visitor_id.substring(0, 12)}...`
                                  : log.visitor_id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(log.visitor_id!)}
                                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Copy visitor_id"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-slate-700">
                          {log.client ? (
                            <div>
                              <div className="font-medium text-slate-900 text-xs">{log.client.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{log.client.phone}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">Guest</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6">
                          {log.clicked_product ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                              <MousePointerClick size={13} className="text-emerald-500 shrink-0" />
                              <span className="truncate max-w-[140px]" title={log.clicked_product.name}>
                                {log.clicked_product.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs text-slate-500">
                          <div>{log.ip_address || "-"}</div>
                        </td>
                        <td className="py-3.5 px-6 text-right text-slate-400 text-xs font-mono">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {logsPagination && logsPagination.last_page > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs">
                <div className="text-slate-500 font-medium">
                  Showing page {logsPagination.current_page} of {logsPagination.last_page} ({logsPagination.total} total logs)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                    disabled={logsPagination.current_page <= 1 || isLoading}
                    className="h-8 text-xs gap-1 border border-slate-200 bg-white shadow-xs"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogsPage((p) => Math.min(logsPagination.last_page, p + 1))}
                    disabled={logsPagination.current_page >= logsPagination.last_page || isLoading}
                    className="h-8 text-xs gap-1 border border-slate-200 bg-white shadow-xs"
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Purge Old Search Logs</h3>
                  <p className="text-xs text-slate-500">Permanently delete aged search log data</p>
                </div>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ডাটাবেজ পারফরম্যান্স অপ্টিমাইজ রাখতে নির্দিষ্ট দিনের পুরনো সার্চ লগ মুছে ফেলা যায়।
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 block">Delete logs older than:</label>
              <select
                value={purgeDays}
                onChange={(e) => setPurgeDays(Number(e.target.value))}
                className="w-full text-sm font-medium text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs"
              >
                <option value={30} className="text-slate-900 bg-white py-1">Older than 30 Days</option>
                <option value={60} className="text-slate-900 bg-white py-1">Older than 60 Days (Recommended)</option>
                <option value={90} className="text-slate-900 bg-white py-1">Older than 90 Days</option>
                <option value={180} className="text-slate-900 bg-white py-1">Older than 180 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="text-xs border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handlePurgeLogs}
                disabled={isPurging}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 rounded-[10px]"
              >
                {isPurging ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Confirm Purge
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
