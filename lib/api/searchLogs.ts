import { requestApi, ApiResponse } from "./client";

export interface SearchSummary {
  period_days: number;
  total_searches: number;
  unique_queries: number;
  zero_result_searches: number;
  zero_results_rate: number;
  total_clicks: number;
  ctr: number;
  unique_visitors: number;
  daily_trend: Array<{
    date: string;
    total_searches: number;
    zero_results: number;
    clicks: number;
  }>;
}

export interface TrendingSearchItem {
  normalized_query: string;
  sample_query: string;
  search_count: number;
  avg_results: number;
  zero_results_count: number;
  clicks_count: number;
  ctr_percentage: number;
  unique_visitors: number;
  last_searched_at: string;
}

export interface NotFoundSearchItem {
  normalized_query: string;
  sample_query: string;
  missed_count: number;
  unique_visitors: number;
  last_searched_at: string;
}

export interface TypoSuggestionItem {
  typo_query: string;
  search_count: number;
  suggested_target: string;
  target_type: "product" | "category" | "brand";
  target_id: number;
  distance: number;
  similarity_score: number;
}

export interface SearchLogEntry {
  id: number;
  query: string;
  normalized_query: string;
  results_count: number;
  source: string;
  visitor_id: string | null;
  client_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  clicked_product_id: number | null;
  clicked_at: string | null;
  created_at: string;
  client?: {
    id: number;
    name: string;
    phone: string;
    email: string;
  } | null;
  clicked_product?: {
    id: number;
    name: string;
    bangla_name?: string | null;
    slug: string;
    image?: string | null;
  } | null;
}

export async function getSearchSummary(days: number = 7): Promise<ApiResponse<SearchSummary>> {
  return requestApi<SearchSummary>("/admin/search-logs/summary", {
    params: { days },
    fallbackData: null,
  });
}

export async function getTrendingSearches(
  days: number = 7,
  limit: number = 20
): Promise<ApiResponse<TrendingSearchItem[]>> {
  return requestApi<TrendingSearchItem[]>("/admin/search-logs/trending", {
    params: { days, limit },
    fallbackData: [],
  });
}

export async function getNotFoundSearches(
  days: number = 30,
  limit: number = 50
): Promise<ApiResponse<NotFoundSearchItem[]>> {
  return requestApi<NotFoundSearchItem[]>("/admin/search-logs/not-found", {
    params: { days, limit },
    fallbackData: [],
  });
}

export async function getTypoSuggestions(days: number = 30): Promise<ApiResponse<TypoSuggestionItem[]>> {
  return requestApi<TypoSuggestionItem[]>("/admin/search-logs/typos", {
    params: { days },
    fallbackData: [],
  });
}

export async function getSearchLogs(
  params: {
    page?: number;
    per_page?: number;
    search_text?: string;
    only_zero_results?: boolean;
    source?: string;
    visitor_id?: string;
    date_from?: string;
    date_to?: string;
  } = {}
): Promise<ApiResponse<SearchLogEntry[]>> {
  return requestApi<SearchLogEntry[]>("/admin/search-logs", {
    params,
    fallbackData: [],
  });
}

export async function clearSearchLogs(
  days: number = 60
): Promise<ApiResponse<{ deleted_count: number; retained_days: number }>> {
  return requestApi<{ deleted_count: number; retained_days: number }>("/admin/search-logs/clear", {
    method: "DELETE",
    params: { days },
    fallbackData: { deleted_count: 0, retained_days: days },
  });
}
