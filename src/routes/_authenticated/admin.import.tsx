import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SADA_LICENSE, SADA_SOURCE, chunk, isValidRow, previewRows, toSegment, type Row } from "@/lib/sada-import";

export const Route = createFileRoute("/_authenticated/admin/import")({
  head: () => ({
    meta: [
      { title: "Dataset import — Nabra admin" },
      { name: "description", content: "Admin-only CSV import for the SADA research dataset." },
      { property: "og:title", content: "Dataset import — Nabra admin" },
      { property: "og:description", content: "Import SADA transcripts in batches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ImportPage,
});

const BATCH = 500;
const COLS = ["FileName", "SegmentID", "SpeakerDialect", "ShowName", "Category", "SegmentStart", "SegmentEnd", "GroundTruthText"];

function ImportPage() {
  const navigate = useNavigate();
  const admin = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      return { isAdmin: Boolean(data), email: u.user?.email ?? "" };
    },
  });
  const counts = useQuery({
    queryKey: ["sada-count"],
    enabled: Boolean(admin.data?.isAdmin),
    queryFn: async () => {
      const { count } = await supabase.from("source_segments").select("id", { count: "exact", head: true }).eq("source", SADA_SOURCE);
      return count ?? 0;
    },
  });
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [scope, setScope] = useState<"preview" | "najdi_hijazi" | "all">("preview");
  const [progress, setProgress] = useState<{ done: number; total: number; inserted: number; skipped: number; error?: string } | null>(null);
  const [running, setRunning] = useState(false);

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/auth", replace: true, search: { redirect: "/admin/import" } }); };

  if (admin.isLoading) return <main className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">Checking access…</main>;
  if (!admin.data?.isAdmin) return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl">Admins only</h1>
      <p className="mt-2 text-sm text-muted-foreground">{admin.data?.email} doesn't have admin access.</p>
      <Button variant="outline" className="mt-4" onClick={signOut}>Sign out</Button>
    </main>
  );

  const valid = rows.filter(isValidRow);
  const najdiHijazi = valid.filter((r) => ["Najdi", "Hijazi"].includes((r.SpeakerDialect ?? "").trim()));
  const preview = previewRows(valid);
  const toImport = scope === "preview" ? preview : scope === "najdi_hijazi" ? najdiHijazi : valid;

  const onFile = (file: File) => {
    setFileName(file.name); setRows([]); setProgress(null);
    Papa.parse<Row>(file, { header: true, skipEmptyLines: true, worker: true, complete: (res) => setRows(res.data) });
  };

  const runImport = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setRunning(true);
    const batches = chunk(toImport, BATCH);
    const state = { done: 0, total: toImport.length, inserted: 0, skipped: 0 } as NonNullable<typeof progress>;
    setProgress({ ...state });
    for (const batch of batches) {
      // Dedupe within the batch too, so a repeated row in the file can't break the upsert.
      const unique = [...new Map(batch.map((r) => [`${r.FileName}|${r.SegmentID}`, toSegment(r, u.user!.id)])).values()];
      const { data, error } = await supabase.from("source_segments")
        .upsert(unique, { onConflict: "source,file_name,segment_id", ignoreDuplicates: true }).select("id");
      if (error) { state.error = error.message; setProgress({ ...state }); break; }
      state.done += batch.length; state.inserted += data?.length ?? 0; state.skipped += batch.length - (data?.length ?? 0);
      setProgress({ ...state });
    }
    setRunning(false);
    counts.refetch();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">SADA dataset import</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {admin.data.email} · {counts.data ?? "…"} segments stored</p>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </div>

      <p className="mt-4 border-s-2 border-accent ps-3 text-sm text-muted-foreground">
        License: {SADA_LICENSE} — non-commercial. These records are stored apart from Nabra's phrase library and are never used for client copy. Khaliji is kept as Khaliji, not Saudi.
      </p>

      <label className="mt-6 block rounded-2xl border border-dashed bg-card p-6 text-center">
        <span className="text-sm font-medium">{fileName || "Choose train.csv"}</span>
        <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <span className="mt-1 block text-xs text-muted-foreground">Unnamed index column is ignored. Rows already imported are skipped.</span>
      </label>

      {rows.length > 0 && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[["Rows in file", rows.length], ["Valid rows", valid.length], ["Najdi / Hijazi", najdiHijazi.length], ["Will import", toImport.length]].map(([l, v]) => (
              <div key={l} className="rounded-xl border bg-card p-3"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-semibold">{Number(v).toLocaleString()}</p></div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select aria-label="Import scope" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)} className="rounded-lg border bg-background p-2 text-sm">
              <option value="preview">Preview 100 Najdi/Hijazi</option>
              <option value="najdi_hijazi">All Najdi/Hijazi</option>
              <option value="all">Entire file</option>
            </select>
            <Button onClick={runImport} disabled={running || toImport.length === 0}>{running ? "Importing…" : `Import ${toImport.length.toLocaleString()} rows in ${Math.ceil(toImport.length / BATCH)} batches`}</Button>
          </div>

          {progress && (
            <div className="mt-4 rounded-xl border bg-card p-4 text-sm" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} /></div>
              <p className="mt-2">{progress.done.toLocaleString()} / {progress.total.toLocaleString()} processed · {progress.inserted.toLocaleString()} new · {progress.skipped.toLocaleString()} already imported</p>
              {progress.error && <p className="mt-1 text-destructive">Stopped: {progress.error}</p>}
            </div>
          )}

          <h2 className="mt-8 font-semibold">Preview — first {preview.length} Najdi/Hijazi records</h2>
          <div className="mt-2 max-h-[600px] overflow-auto rounded-xl border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-secondary"><tr>{COLS.map((c) => <th key={c} className="p-2 text-start font-medium">{c}</th>)}</tr></thead>
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i} className="border-t align-top">
                    {COLS.map((c) => <td key={c} dir={c === "GroundTruthText" ? "rtl" : undefined} className={`p-2 ${c === "GroundTruthText" ? "min-w-[280px] text-sm" : "whitespace-nowrap"}`}>{r[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
