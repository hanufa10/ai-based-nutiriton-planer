import { apiFetch } from "../api";

export interface HydrationDay {
  logDate: string;
  liters: number;
}

export interface HydrationLogEntry extends HydrationDay {
  hydrationLogId: number;
  userId: number;
  updatedAt: string;
}

export function getHydration(date: string) {
  return apiFetch<HydrationDay>(`/hydration?date=${encodeURIComponent(date)}`);
}

export function addHydration(logDate: string, addLiters: number) {
  return apiFetch<HydrationLogEntry>("/hydration", {
    method: "PUT",
    body: JSON.stringify({ logDate, addLiters }),
  });
}
