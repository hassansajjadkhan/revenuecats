"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/dashboard";
    setNextPath(next);

    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace(next);
      }
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(nextPath);
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white grid grid-cols-1 lg:grid-cols-2">
      <section className="relative bg-[#252628] border-r border-white/10">
        <div className="absolute top-8 left-8">
          <div className="w-9 h-9 rounded-md bg-[#ed4d5f] grid place-items-center font-bold text-sm">RC</div>
        </div>

        <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center px-8 sm:px-14">
          <h1 className="text-5xl font-semibold tracking-tight mb-3">Log in</h1>
          <p className="text-white/75 mb-10 text-lg">
            Welcome back! Please enter your email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/85 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

            <div>
              <label className="block text-sm text-white/85 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-300">{error}</p>
            )}

            <div className="flex items-center justify-end gap-4 pt-1">
              <Link href="/signup" className="text-[#8ea2ff] hover:text-[#b0bbff] text-lg">
                Sign up
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="mt-16 text-sm text-white/65 flex flex-wrap gap-x-4 gap-y-2">
            <span>Terms and conditions</span>
            <span>Privacy policy</span>
            <span>RevenueCat Status</span>
            <span>Manage cookies</span>
          </div>
        </div>
      </section>

      <section className="hidden lg:flex items-center justify-center bg-[#141b2a] px-12">
        <div className="grid grid-cols-6 gap-3 max-w-xl">
          {Array.from({ length: 60 }).map((_, index) => (
            <div
              key={index}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2e3440] to-[#1d2230] border border-white/10"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
