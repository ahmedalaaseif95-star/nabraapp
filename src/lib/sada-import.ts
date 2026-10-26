// SADA research dataset (CC BY-NC-SA 4.0). Kept separate from Nabra's commercial library.
export const SADA_SOURCE = "SADA";
export const SADA_LICENSE = "CC BY-NC-SA 4.0";
export const PREVIEW_DIALECTS = ["Najdi", "Hijazi"];
const UNCERTAIN = ["More than 1 speaker", "More than one speaker", "Unknown", "Notapplicable", "", "Khaliji"];

export type Row = Record<string, string | undefined>;

export function normalizeArabic(text: string): string {
  return text.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

const num = (v?: string) => { const n = Number(v); return v === undefined || v === "" || Number.isNaN(n) ? null : n; };

export function toSegment(row: Row, userId: string) {
  const gt = row.GroundTruthText ?? "";
  const dialect = (row.SpeakerDialect ?? "").trim();
  return {
    source: SADA_SOURCE,
    license: SADA_LICENSE,
    commercial_use_allowed: false,
    file_name: (row.FileName ?? "").trim(),
    segment_id: (row.SegmentID ?? "").trim(),
    ground_truth_text: gt,
    processed_text: row.ProcessedText ?? "",
    search_text: normalizeArabic(row.ProcessedText || gt),
    speaker_dialect: dialect,
    show_name: row.ShowName ?? null,
    category: row.Category ?? null,
    segment_start: num(row.SegmentStart),
    segment_end: num(row.SegmentEnd),
    flag_empty_text: !gt.trim() && !(row.ProcessedText ?? "").trim(),
    flag_uncertain_dialect: UNCERTAIN.includes(dialect),
    imported_by: userId,
  };
}

export function isValidRow(row: Row): boolean {
  return Boolean(row.FileName?.trim() && row.SegmentID?.trim());
}

export function previewRows(rows: Row[], limit = 100): Row[] {
  return rows.filter((r) => PREVIEW_DIALECTS.includes((r.SpeakerDialect ?? "").trim())).slice(0, limit);
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
