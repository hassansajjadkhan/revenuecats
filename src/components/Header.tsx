"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  RefreshCw,
  Search,
  HelpCircle,
  User,
  X,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
  onSearch?: (query: string) => void;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  isLoading,
  lastUpdated,
  onSearch,
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch?.("");
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    let mounted = true;

    const loadUser = async () => {
      const { data } = await client.auth.getUser();
      if (!mounted) return;
      setCurrentUser(data.user ?? null);
    };

    loadUser();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  const userName =
    (currentUser?.user_metadata?.full_name as string | undefined) ||
    (currentUser?.email?.split("@")[0] as string | undefined) ||
    "Account";

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setMenuOpen(false);
    router.push("/login");
  };
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-7 h-12 bg-[#0f1218]/95 border-b border-rc-border sticky top-0 z-30 backdrop-blur">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-[14px] leading-none font-medium text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-rc-textMuted mt-1 hidden xl:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {lastUpdated && (
          <span className="text-[11px] text-rc-textDim hidden xl:block">
            Updated {lastUpdated}
          </span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all",
              "bg-[#181c25] text-rc-textMuted hover:text-white",
              "border border-rc-border",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#11141b] border border-rc-border text-[#8892a4] text-[12px] hover:border-rc-borderLight transition-colors min-w-[190px] focus-within:border-rc-accent focus-within:text-white">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-white placeholder:text-[#8892a4] text-[12px]"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="flex-shrink-0 p-0.5 hover:bg-[#181c25] rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          {!searchQuery && (
            <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-[#0c0f14] rounded border border-rc-border">Ctrl+K</kbd>
          )}
        </div>

        <button className="p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors md:hidden">
          <Search className="w-4 h-4" />
        </button>

        <button className="hidden sm:flex items-center gap-1 p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors text-[12px]">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden lg:inline">Help</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              if (!currentUser) {
                router.push("/login");
                return;
              }
              setMenuOpen((prev) => !prev);
            }}
            className="flex items-center gap-1 p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors text-[12px]"
          >
            <User className="w-4 h-4" />
            <span className="hidden lg:inline">{currentUser ? "Account" : "Log in"}</span>
          </button>

          {menuOpen && currentUser && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-rc-border bg-[#2a2c31] shadow-2xl p-3 z-50">
              <div className="pb-3 border-b border-white/15">
                <p className="text-2xl font-semibold text-white leading-tight">{userName}</p>
                <p className="text-sm text-white/85 leading-tight mt-1">{currentUser.email}</p>
              </div>

              <div className="pt-2 space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Account settings</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-white/80" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
