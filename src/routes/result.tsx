import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export const Route = createFileRoute("/result")({
  head: () => ({
    meta: [
      { title: "Review your copy — Nabra" },
      { name: "description", content: "Review, edit and approve AI-written dialect copy before it's used." },
      { property: "og:title", content: "Review your copy — Nabra" },
      { property: "og:description", content: "Every result is approved by a person before use." },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { t, result, draft, addApproved } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState(result?.copy ?? "");
  const [amends, setAmends] = useState(1);
  const [done, setDone] = useState(false);
  useEffect(() => { setText(result?.copy ?? ""); setDone(false); }, [result]);

  if (!result) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-muted-foreground">{t.empty}</p>
        <Button asChild className="mt-4 rounded-full"><Link to="/">{t.start}</Link></Button>
      </main>
    );
  }

  const approve = () => {
    addApproved({ id: crypto.randomUUID(), date: new Date().toISOString(), dialect: draft.dialect, brand: draft.brand, copy: text, amends });
    setDone(true);
    toast.success(t.approved);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl">{t.result}</h1>
      <p className="mt-2 text-muted-foreground">{t.result_hint}</p>

      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">{t[draft.dialect]}</span>
            {draft.brand && <span>{draft.brand}</span>}
          </div>
          <textarea dir="rtl" rows={9} value={text} onChange={(e) => { setText(e.target.value); setDone(false); }}
            className="w-full resize-none rounded-lg border bg-background p-4 text-lg leading-loose outline-none focus:ring-2 focus:ring-ring" />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">{t.amends}</label>
            <input type="number" min={0} max={10} value={amends} onChange={(e) => setAmends(Number(e.target.value))}
              className="w-16 rounded-lg border bg-background px-2 py-1 text-sm" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="rounded-full" onClick={approve} disabled={done || !text.trim()}>{done ? "✓ " + t.approved : t.approve}</Button>
            <Button variant="outline" className="rounded-full" onClick={() => { navigator.clipboard.writeText(text); toast(t.copied); }}>{t.copy_btn}</Button>
            <Button variant="ghost" className="rounded-full" onClick={() => navigate({ to: "/" })}>{t.regenerate}</Button>
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-semibold">{t.why}</h2>
          <ul className="space-y-3">
            {result.notes.map((n, i) => (
              <li key={i} className="rounded-xl bg-muted p-3">
                <div dir="rtl" className="font-medium text-primary">{n.phrase}</div>
                <p dir="ltr" className="mt-1 text-sm text-muted-foreground">{n.why}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
