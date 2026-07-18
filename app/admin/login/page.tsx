"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
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

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <main className="wrap section" style={{ maxWidth: 420 }}>
      <h1>Admin login</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
        Only email addresses on the admin allow-list can access the dashboard, even after
        signing in successfully.
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
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
