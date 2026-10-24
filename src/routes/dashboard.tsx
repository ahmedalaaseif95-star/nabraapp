import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";
import { AMENDS } from "@/lib/nabra-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Rounds of amends dashboard — Nabra" },
      { name: "description", content: "Track rounds of amends per piece of copy, week by week." },
      { property: "og:title", content: "Rounds of amends dashboard — Nabra" },
      { property: "og:description", content: "See how Nabra reduces client amends week by week." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, approved } = useApp();
  const weeks = [...AMENDS];
  if (approved.length) {
    const avg = approved.reduce((s, a) => s + a.amends, 0) / approved.length;
    weeks.push({ week: "Now", before: 4.0, withNabra: Math.round(avg * 10) / 10 });
  }
  const max = 5;
  const withVals = weeks.filter((w) => w.withNabra !== null);
  const latest = withVals[withVals.length - 1];
  const beforeAvg = weeks.reduce((s, w) => s + w.before, 0) / weeks.length;
  const drop = latest?.withNabra != null ? Math.round((1 - latest.withNabra / beforeAvg) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl">{t.dash}</h1>
      <p className="mt-2 text-muted-foreground">{t.dash_hint}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label={t.before} value={beforeAvg.toFixed(1)} />
        <Stat label={t.with} value={latest?.withNabra?.toFixed(1) ?? "—"} accent />
        <Stat label={t.drop} value={`${drop}%`} />
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="mb-4 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-muted-foreground/40" />{t.before}</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm bg-primary" />{t.with}</span>
        </div>
        <div dir="ltr" className="flex h-56 items-end gap-3 sm:gap-6">
          {weeks.map((w) => (
            <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-48 w-full items-end justify-center gap-1">
                <Bar h={(w.before / max) * 100} v={w.before} cls="bg-muted-foreground/40" />
                {w.withNabra !== null && <Bar h={(w.withNabra / max) * 100} v={w.withNabra} cls="bg-primary" />}
              </div>
              <span className="text-xs text-muted-foreground">{w.week}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-5">
        <h2 className="mb-3 font-semibold">{t.approvedList}</h2>
        {approved.length === 0 ? <p className="text-sm text-muted-foreground">{t.none}</p> : (
          <ul className="divide-y">
            {approved.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-3">
                <p dir="rtl" className="line-clamp-2 flex-1 text-sm">{a.copy}</p>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs">{t[a.dialect]} · {a.amends}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <div className={`text-sm ${accent ? "opacity-85" : "text-muted-foreground"}`}>{label}</div>
      <div className="mt-1 font-display text-4xl">{value}</div>
    </div>
  );
}

function Bar({ h, v, cls }: { h: number; v: number; cls: string }) {
  return (
    <div className={`relative w-1/2 max-w-8 rounded-t-md ${cls}`} style={{ height: `${h}%` }}>
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">{v}</span>
    </div>
  );
}
