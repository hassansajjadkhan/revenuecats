"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          source,
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setSuccess("Account created. You can now log in.");
    setTimeout(() => router.push("/login"), 900);
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white grid grid-cols-1 lg:grid-cols-2">
      <section className="relative bg-[#252628] border-r border-white/10">
        <div className="absolute top-8 left-8">
          <div className="w-9 h-9 rounded-md bg-[#ed4d5f] grid place-items-center font-bold text-sm">RC</div>
        </div>

        <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center px-8 sm:px-14">
          <h1 className="text-5xl font-semibold tracking-tight mb-3">Sign up</h1>
          <p className="text-white/75 mb-10 text-lg">
            The world&apos;s best apps use RevenueCat to power purchases, manage customer data,
            and grow revenue on iOS, Android, and the web.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-white/85 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

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
                minLength={6}
                required
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              />
            </div>

            <div>
              <label className="block text-sm text-white/85 mb-2">How did you hear about us?</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-white/20 bg-[#2a2c31] outline-none focus:border-[#6c82ff]"
              >
                <option value="">Select One</option>
                <option value="Search">Search</option>
                <option value="Referral">Referral</option>
                <option value="Social">Social</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {success && <p className="text-sm text-emerald-300">{success}</p>}

            <div className="flex items-center justify-end gap-4 pt-1">
              <Link href="/login" className="text-[#8ea2ff] hover:text-[#b0bbff] text-lg">
                Log in
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Sign up"}
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

      <section className="hidden lg:flex items-center justify-center bg-[#141b2a] px-14">
        <div className="max-w-2xl text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#f0a3ff] via-[#8f80ff] to-[#4e68ff] grid place-items-center text-5xl font-black">
            R
          </div>
          <p className="text-4xl font-semibold leading-snug">
            &ldquo;RevenueCat is at the center of our stack for subscriptions. It enables us to
            have one single source of truth for subscriptions and revenue data.&rdquo;
          </p>
          <p className="mt-8 text-xl text-white/80">Olivier Lemarle</p>
          <p className="text-lg text-white/55">Head of Growth and Marketing at Photoroom</p>
        </div>
      </section>
    </main>
  );
}
