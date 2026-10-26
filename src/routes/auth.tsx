import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/") && !s["redirect"].startsWith("//") ? s["redirect"] : "/admin/import" }),
  head: () => ({
    meta: [
      { title: "Admin sign-in — Nabra" },
      { name: "description", content: "Sign in to manage Nabra's dialect datasets." },
      { property: "og:title", content: "Admin sign-in — Nabra" },
      { property: "og:description", content: "Admin access for Nabra dataset tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + redirect } });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="font-display text-3xl">{mode === "in" ? "Admin sign-in" : "Create admin account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Only needed for dataset tools. Writers don't need an account.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="email" required aria-label="Email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <input type="password" required minLength={8} aria-label="Password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
        <Button type="submit" className="w-full rounded-full" disabled={busy}>{mode === "in" ? "Sign in" : "Sign up"}</Button>
      </form>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 text-sm text-accent underline-offset-4 hover:underline">
        {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
      </button>
    </main>
  );
}
