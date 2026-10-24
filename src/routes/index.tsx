import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { LIBRARY, type Dialect } from "@/lib/nabra-data";
import { generateCopy } from "@/lib/generate.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nabra — Write copy in the right Arabic dialect" },
      { name: "description", content: "Turn your idea into native Saudi or Iraqi marketing copy with a curated dialect phrase library." },
      { property: "og:title", content: "Nabra — Write copy in the right Arabic dialect" },
      { property: "og:description", content: "Native Saudi and Iraqi copy for Egyptian content writers." },
    ],
  }),
  component: InputPage,
});

const SAMPLE = {
  brand: "Bait Al Shawarma",
  idea: "عايزين نقول للناس إن الشاورما عندنا حلوة أوي وطعمها زي بتاع البيت، وفيه خصم ٢٠٪ النهارده بس، الحقوا!",
};

function InputPage() {
  const { t, draft, setDraft, setResult } = useApp();
  const gen = useServerFn(generateCopy);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const entries = LIBRARY.filter((e) => e.dialect === draft.dialect);

  const setDialect = (d: Dialect) => setDraft({ ...draft, dialect: d, selected: [] });
  const toggle = (id: string) =>
    setDraft({ ...draft, selected: draft.selected.includes(id) ? draft.selected.filter((x) => x !== id) : [...draft.selected, id] });

  const useSample = () =>
    setDraft({ ...draft, ...SAMPLE, selected: entries.filter((e) => e.context === "Food" || e.context === "Offers").map((e) => e.id) });

  const submit = async () => {
    if (draft.idea.trim().length < 3) return;
    setLoading(true);
    try {
      const refs = LIBRARY.filter((e) => draft.selected.includes(e.id)).map((e) => `${e.text} (${e.kind}, ${e.context}): ${e.note}`);
      const r = await gen({ data: { dialect: draft.dialect, brand: draft.brand, tone: draft.tone, idea: draft.idea, references: refs } });
      setResult(r);
      navigate({ to: "/result" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const kindLabel = { word: t.word, hook: t.hook, campaign: t.campaign };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <section className="mb-8">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">{t.tagline}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{t.sub}</p>
      </section>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-soft">
          <div>
            <label className="mb-2 block text-sm font-medium">{t.dialect}</label>
            <div className="inline-flex rounded-full bg-muted p-1">
              {(["saudi", "iraqi"] as const).map((d) => (
                <button key={d} onClick={() => setDialect(d)}
                  className={`rounded-full px-5 py-1.5 text-sm transition-colors ${draft.dialect === d ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  {t[d]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.brand}</label>
              <input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{t.tone}</label>
              <select value={draft.tone} onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring">
                {t.toneOpts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium">{t.idea}</label>
              <button onClick={useSample} className="text-xs font-medium text-accent underline-offset-4 hover:underline">{t.sample}</button>
            </div>
            <textarea dir="rtl" rows={6} value={draft.idea} placeholder={t.idea_ph}
              onChange={(e) => setDraft({ ...draft, idea: e.target.value })}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Button size="lg" className="w-full rounded-full" disabled={loading || draft.idea.trim().length < 3} onClick={submit}>
            {loading ? t.generating : t.generate}
          </Button>
        </div>

        <aside className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">{t.library}</h2>
          <p className="mb-4 text-sm text-muted-foreground">{t.library_hint}</p>
          <ul className="space-y-2">
            {entries.map((e) => {
              const on = draft.selected.includes(e.id);
              return (
                <li key={e.id}>
                  <button onClick={() => toggle(e.id)}
                    className={`w-full rounded-xl border p-3 text-start transition-colors ${on ? "border-primary bg-secondary" : "hover:bg-muted"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span dir="rtl" className="font-medium">{e.text}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{kindLabel[e.kind]} · {e.context}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{e.note}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}
