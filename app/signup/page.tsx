"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If Supabase has email confirmation turned on, there's no session yet —
    // the person needs to click the link in their inbox first.
    if (!data.session) {
      setMessage("Account created — check your email to confirm before signing in.");
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <main className="wrap section" style={{ maxWidth: 420 }}>
      <h1>Create your account</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>
        Sign up to keep track of every event you book — see all your tickets in one place.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div className="form-row">
          <label>Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "var(--pink)", fontSize: 13 }}>{error}</p>}
        {message && <p style={{ color: "var(--gold)", fontSize: 13 }}>{message}</p>}
        <button type="submit" className="btn" disabled={loading} style={{ marginTop: 10 }}>
          <UserPlus size={16} style={{ marginRight: 6 }} />
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
      <p style={{ marginTop: 18, fontSize: 14, color: "var(--ink-soft)" }}>
        Already have an account? <a href="/login">Log in</a>
      </p>
    </main>
  );
}
