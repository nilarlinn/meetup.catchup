"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="wrap section" style={{ maxWidth: 420 }}>
      <h1>Log in</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
        Log in to see the tickets you've booked.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div className="form-row">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--pink)", fontSize: 13 }}>{error}</p>}
        <button type="submit" className="btn" disabled={loading} style={{ marginTop: 10 }}>
          <LogIn size={16} style={{ marginRight: 6 }} />
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p style={{ marginTop: 18, fontSize: 14, color: "var(--ink-soft)" }}>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </main>
  );
}
