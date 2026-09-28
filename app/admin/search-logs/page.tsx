import { Suspense } from "react";
import { getSearchSummary, getTrendingSearches, getNotFoundSearches, getTypoSuggestions } from "@/lib/api/searchLogs";
import SearchLogsClient from "./SearchLogsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Search Logs & Audit - Admin",
  description: "Search analytics, trending queries, zero-result searches, and typo audits.",
};

export default async function SearchLogsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; days?: string; period?: string }>;
}) {
  const resolvedParams = await searchParams;
  const daysStr = resolvedParams?.days || resolvedParams?.period;
  const days = daysStr ? parseInt(daysStr, 10) : 7;
  const validDays = isNaN(days) || days <= 0 ? 7 : days;

  const [summaryRes, trendingRes, notFoundRes, typosRes] = await Promise.all([
    getSearchSummary(validDays),
    getTrendingSearches(validDays, 50),
    getNotFoundSearches(validDays, 50),
    getTypoSuggestions(validDays),
  ]);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#BA478F]" />
        </div>
      }
    >
      <SearchLogsClient
        initialSummary={summaryRes.success ? summaryRes.resources : null}
        initialTrending={trendingRes.success ? trendingRes.resources : []}
        initialNotFound={notFoundRes.success ? notFoundRes.resources : []}
        initialTypos={typosRes.success ? typosRes.resources : []}
        initialDays={validDays}
      />
    </Suspense>
  );
}
