"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const verifySession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsChecking(false);
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(data.user ?? null);
      setIsChecking(false);

      if (!data.user) {
        const next = encodeURIComponent(pathname || "/dashboard");
        router.replace(`/login?next=${next}`);
      }
    };

    verifySession();

    const {
      data: { subscription },
    } = supabase
      ? supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          if (!session?.user) {
            const next = encodeURIComponent(pathname || "/dashboard");
            router.replace(`/login?next=${next}`);
          }
        })
      : { data: { subscription: null } };

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname, router]);

  if (!isSupabaseConfigured) {
    return <>{children}</>;
  }

  if (isChecking || !user) {
    return (
      <div className="min-h-screen grid place-items-center dashboard-shell px-6">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-rc-border border-t-rc-accent animate-spin mx-auto mb-4" />
          <p className="text-sm text-rc-textMuted">Checking your session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
