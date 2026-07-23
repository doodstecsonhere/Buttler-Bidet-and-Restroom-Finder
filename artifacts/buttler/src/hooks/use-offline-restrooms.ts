/**
 * Offline-aware restroom data hook.
 *
 * Strategy:
 *  1. If navigator.onLine is false on mount → immediately serve localStorage cache.
 *  2. If online → fetch /api/restrooms, persist result to localStorage, serve fresh data.
 *  3. If network fetch fails (went offline mid-load) → fall back to localStorage cache.
 *  4. If there is no cache at all and the network also fails → surface the error.
 *
 * The cache key is versioned so a future schema change can bust stale entries.
 */

import { useState, useEffect } from "react";

const CACHE_KEY = "buttler_restrooms_v3";

export interface CachedRestroom {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  access: string;
  fee: string;
  bidet: boolean;
}

interface UseOfflineRestroomsResult {
  data: CachedRestroom[] | null;
  isLoading: boolean;
  error: Error | null;
  /** true when the data was served from the local cache (no live network hit) */
  isFromCache: boolean;
}

export function useOfflineRestrooms(): UseOfflineRestroomsResult {
  const [data, setData] = useState<CachedRestroom[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      // ── 1. If offline, serve cache immediately ────────────────────────────
      if (!navigator.onLine) {
        const cached = readCache();
        if (!cancelled) {
          if (cached) {
            setData(cached);
            setIsFromCache(true);
          } else {
            setError(new Error("You are offline and no cached data is available."));
          }
          setIsLoading(false);
        }
        return;
      }

      // ── 2. Online: fetch fresh data ───────────────────────────────────────
      try {
        const response = await fetch("/api/restrooms");
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const rooms: CachedRestroom[] = await response.json();
        if (!cancelled) {
          setData(rooms);
          setIsFromCache(false);
          setIsLoading(false);
          writeCache(rooms);
        }
      } catch (err) {
        // ── 3. Network failed mid-load: try cache ─────────────────────────
        const cached = readCache();
        if (!cancelled) {
          if (cached) {
            setData(cached);
            setIsFromCache(true);
            setIsLoading(false);
          } else {
            setError(err instanceof Error ? err : new Error("Failed to load restrooms"));
            setIsLoading(false);
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error, isFromCache };
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

function readCache(): CachedRestroom[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as CachedRestroom[];
  } catch {
    return null;
  }
}

function writeCache(rooms: CachedRestroom[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rooms));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded) — ignore silently
  }
}
