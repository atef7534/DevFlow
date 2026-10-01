"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Cloud, LockKeyhole } from "lucide-react";
import { isCloudConfigured, supabase } from "@/services/supabase";
import { Button, Field } from "@/components/ui";

export default function SignInPage() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    if (!isCloudConfigured || !supabase) { setError("Cloud accounts are not configured on this installation. You can keep using the local workspace."); setBusy(false); return; }
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim() } } });
        if (authError) throw authError;
        if (data.session) window.location.assign("/today");
        else setMessage("Check your inbox to confirm your email, then come back here to sign in.");
      } else if (mode === "reset") {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/signin` });
        if (authError) throw authError;
        setMessage("Password reset instructions are on their way.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.assign("/today");
      }
    } catch (caught) { setError(caught.message || "We couldn't complete that request. Try again."); }
    finally { setBusy(false); }
  }

  const title = mode === "signup" ? "Make this space yours." : mode === "reset" ? "A fresh start." : "Welcome back.";
  return <main className="auth-page"><Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to DevFlow</Link><section className="auth-card"><div className="auth-symbol"><Cloud size={18} /></div><div className="eyebrow">DEVFLOW CLOUD</div><h1>{title}</h1><p className="auth-intro">{isCloudConfigured ? "Your projects, notes, and learning progress, wherever you are." : "Use the device workspace, or connect Supabase to sync your progress."}</p>
    {isCloudConfigured ? <form className="auth-form" onSubmit={submit}>
      {mode === "signup" && <Field label="Your name" value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" placeholder="Atif Yasser" />}
      <Field label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" />
      {mode !== "reset" && <Field label="Password" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" />}
      {error && <div className="form-message form-error" role="alert">{error}</div>}{message && <div className="form-message form-success" role="status">{message}</div>}
      <Button type="submit" className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}<ArrowRight size={15} /></Button>
      <div className="auth-links">{mode === "signin" ? <><button type="button" onClick={() => setMode("reset")}>Forgot password?</button><span>New here? <button type="button" onClick={() => setMode("signup")}>Create an account</button></span></> : <button type="button" onClick={() => setMode("signin")}>Back to sign in</button>}</div>
    </form> : <div className="auth-local"><div className="local-cloud-note"><LockKeyhole size={16} /><span><strong>Your data stays on this device.</strong><small>Local workspaces don't need a login.</small></span></div><Link href="/today" className="button button-primary button-lg">Continue locally <ArrowRight size={15} /></Link><p>To enable cloud sync, add the two public Supabase values to <code>.env.local</code> and run the included SQL migration.</p></div>}
    <div className="auth-foot">DevFlow keeps your work private and in your control.</div></section></main>;
}
