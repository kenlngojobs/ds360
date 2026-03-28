import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

const IS_DEV = import.meta.env.DEV;
const BASE = "/api";

interface FeatureFlagContextValue {
  flags: Set<string>;
  loading: boolean;
  hasFlag: (key: string) => boolean;
  refresh: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: new Set(),
  loading: true,
  hasFlag: () => false,
  refresh: () => {},
});

/**
 * Wrap the authenticated app in this provider.
 * Fetches flags from /api/flags.php using the session token.
 */
export function FeatureFlagProvider({
  token,
  children,
}: {
  token: string;
  children: ReactNode;
}) {
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    // In dev mode, enable all flags so local dev isn't gated
    if (IS_DEV) {
      setFlags(new Set([
        "module.users", "module.document-templates", "module.offerings",
        "module.home", "module.partners", "module.account-treatment",
        "module.tags", "module.category", "module.groups", "module.messages",
        "module.my-deals", "module.post-sale", "module.sam-documents",
        "module.notifications", "module.reports", "module.settings",
        "feature.template-export", "feature.template-import",
        "feature.user-management",
      ]));
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${BASE}/flags.php`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.flags)) {
        setFlags(new Set(data.flags));
      }
    } catch {
      // If flags fail to load, keep empty set (all features hidden)
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const hasFlag = useCallback((key: string) => flags.has(key), [flags]);

  return (
    <FeatureFlagContext.Provider value={{ flags, loading, hasFlag, refresh: fetchFlags }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/** Check if a feature flag is enabled. */
export function useFlag(key: string): boolean {
  return useContext(FeatureFlagContext).hasFlag(key);
}

/** Access the full flag context (loading state, refresh, etc). */
export function useFeatureFlags(): FeatureFlagContextValue {
  return useContext(FeatureFlagContext);
}

/**
 * Declarative feature gate.
 * Renders children only when the given flag is enabled.
 * Optional `fallback` renders in place when the flag is off (defaults to nothing).
 *
 * Usage:
 *   <Gate flag="feature.canvas-add-global-style">
 *     <AddStyleButton />
 *   </Gate>
 *
 *   <Gate flag="feature.fancy-thing" fallback={<span>Coming soon</span>}>
 *     <FancyThing />
 *   </Gate>
 */
export function Gate({
  flag,
  children,
  fallback = null,
}: {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const enabled = useFlag(flag);
  return <>{enabled ? children : fallback}</>;
}
