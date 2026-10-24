import { useState } from "react";
import { Check, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { LIBRARY, SOURCES, filterLibrary, isNativeReviewed } from "@/lib/nabra-data";

export function PhraseLibrary() {
  const { lang, t, draft, setDraft } = useApp();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const ar = lang === "ar";
  const dialectEntries = LIBRARY.filter((entry) => entry.dialect === draft.dialect);
  const entries = filterLibrary(dialectEntries, { query, kind, status });
  const reviewedCount = dialectEntries.filter(isNativeReviewed).length;
  const toggle = (id: string) => setDraft({ ...draft, selected: draft.selected.includes(id) ? draft.selected.filter((value) => value !== id) : [...draft.selected, id] });
  const kindLabel = { word: t.word, hook: t.hook, campaign: t.campaign, phrase: ar ? "عبارة" : "Phrase" };

  return (
    <aside className="min-w-0 border-t pt-5 md:border-s md:border-t-0 md:ps-6 md:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{t.library}</h2>
        <span className="text-xs text-muted-foreground">{draft.selected.length} {ar ? "مختارة" : "selected"}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{dialectEntries.length} {ar ? "كلمة وعبارة" : "words & phrases"} · {reviewedCount} {ar ? "بمراجعة موثّقة من متحدث أصلي" : "with documented native review"}</p>
      <p className="mt-3 border-s-2 border-primary ps-3 text-xs leading-relaxed text-muted-foreground">
        {ar ? "المصدر لا يعني مراجعة لغوية. أي عبارة بلا مراجعة موثّقة من متحدث سعودي أو عراقي أصلي تُصنّف غير متحقّق منها. راجع اللهجة والسياق قبل الاستخدام." : "A source is not a native-speaker review. Entries without documented Saudi or Iraqi native review are unverified. Check dialect and context before use."}
      </p>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute start-3 top-3 size-4 text-muted-foreground" />
        <input aria-label={ar ? "ابحث في مكتبة العبارات" : "Search phrase library"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "ابحث بالعربية أو الإنجليزية…" : "Search Arabic or English…"} className="w-full rounded-lg border bg-background py-2 pe-3 ps-9 text-sm outline-none focus:ring-2 focus:ring-ring" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select aria-label={ar ? "نوع العبارة" : "Phrase type"} value={kind} onChange={(event) => setKind(event.target.value)} className="min-w-0 rounded-lg border bg-background p-2 text-sm">
          <option value="all">{ar ? "كل الأنواع" : "All types"}</option>
          <option value="word">{t.word}</option><option value="phrase">{ar ? "عبارة" : "Phrase"}</option>
        </select>
        <select aria-label={ar ? "حالة المراجعة" : "Review status"} value={status} onChange={(event) => setStatus(event.target.value)} className="min-w-0 rounded-lg border bg-background p-2 text-sm">
          <option value="all">{ar ? "كل الحالات" : "All statuses"}</option>
          <option value="reviewed">{ar ? "مراجعة موثّقة" : "Native-reviewed"}</option>
          <option value="unverified">{ar ? "غير متحقّق منها" : "Unverified"}</option>
          <option value="selected">{ar ? "المختارة" : "Selected"}</option>
        </select>
      </div>
      <p aria-live="polite" className="my-3 text-xs text-muted-foreground">{(status === "selected" ? entries.filter((entry) => draft.selected.includes(entry.id)) : entries).length} {ar ? "نتيجة" : "results"}</p>
      <ul className="max-h-[640px] space-y-2 overflow-y-auto pe-1">
        {entries.filter((entry) => status !== "selected" || draft.selected.includes(entry.id)).map((entry) => {
          const selected = draft.selected.includes(entry.id);
          const reviewed = isNativeReviewed(entry);
          const source = entry.sourceId ? SOURCES[entry.sourceId] : undefined;
          return (
            <li key={entry.id} className={`rounded-lg border p-3 ${selected ? "border-primary bg-secondary" : "bg-card"}`}>
              <Button variant="ghost" aria-pressed={selected} onClick={() => toggle(entry.id)} className="h-auto w-full justify-between whitespace-normal px-0 py-1 text-start hover:bg-transparent">
                <span dir="rtl" className="text-base font-medium">{entry.text}</span>
                <Check aria-hidden="true" className={`shrink-0 ${selected ? "text-primary" : "text-muted-foreground/30"}`} />
              </Button>
              <p dir="ltr" className="mt-1 text-sm">{entry.meaning}</p>
              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                <span>{kindLabel[entry.kind]} · {entry.context}</span>
                <span className={reviewed ? "font-medium text-primary" : "font-medium text-accent"}>{reviewed ? (ar ? "مراجعة موثّقة" : "Native-reviewed") : (ar ? "غير متحقّق منها" : "Unverified")}</span>
              </div>
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer">{ar ? "السياق والمصدر" : "Usage & source"}</summary>
                <p dir="ltr" className="mt-2 leading-relaxed">{entry.note}</p>
                {source ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-primary underline"><ExternalLink className="size-3" />{source.title}</a> : <p className="mt-2">{ar ? "لا يوجد مصدر موثّق." : "No documented source."}</p>}
                {entry.nativeReview && <p className="mt-2">{entry.nativeReview.reviewer} · {entry.nativeReview.date}</p>}
              </details>
            </li>
          );
        })}
      </ul>
      {entries.length === 0 && <p className="py-6 text-sm text-muted-foreground">{ar ? "لا توجد عبارات تطابق هذه الفلاتر." : "No phrases match these filters."}</p>}
    </aside>
  );
}