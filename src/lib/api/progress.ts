import { apiFetch } from "../api";
import type { ProgressEntry, ProgressSummary } from "../api-types";

export function getProgress(params?: { from?: string; to?: string }) {
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const q = search.toString();
  return apiFetch<ProgressEntry[]>(`/progress${q ? `?${q}` : ""}`);
}

export function getProgressSummary(date: string) {
  return apiFetch<ProgressSummary>(`/progress/summary?date=${encodeURIComponent(date)}`);
}
