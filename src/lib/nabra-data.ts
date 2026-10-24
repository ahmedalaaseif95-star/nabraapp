export type Dialect = "saudi" | "iraqi";
export type Kind = "word" | "phrase" | "hook" | "campaign";

export interface LibraryEntry {
  id: string;
  dialect: Dialect;
  kind: Kind;
  context: string;
  text: string;
  note: string; // when it sounds natural / what to avoid
  meaning?: string;
  sourceId?: string;
  nativeReview?: { reviewer: string; dialect: Dialect; date: string; evidenceUrl: string };
}

export const SOURCES: Record<string, { title: string; url: string }> = {};

export function isNativeReviewed(entry: LibraryEntry): boolean {
  const review = entry.nativeReview;
  return Boolean(review && review.dialect === entry.dialect && review.reviewer.trim() && /^\d{4}-\d{2}-\d{2}$/.test(review.date) && /^https:\/\//.test(review.evidenceUrl));
}

export function filterLibrary(entries: LibraryEntry[], filters: { query: string; kind: string; status: string }): LibraryEntry[] {
  const normalize = (text: string) => text.toLowerCase().normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").trim();
  const query = normalize(filters.query);
  return entries.filter((entry) =>
    (filters.kind === "all" || entry.kind === filters.kind) &&
    (filters.status !== "reviewed" || isNativeReviewed(entry)) &&
    (filters.status !== "unverified" || !isNativeReviewed(entry)) &&
    (!query || normalize(`${entry.text} ${entry.meaning ?? ""} ${entry.context} ${entry.note}`).includes(query))
  );
}

// Sample library (not native-reviewed yet — demo data only).
export const LIBRARY: LibraryEntry[] = [
  { id: "s1", dialect: "saudi", kind: "word", context: "Food", text: "مرّة لذيذ", note: "Saudi intensifier 'مرّة' instead of Egyptian 'أوي'." },
  { id: "s2", dialect: "saudi", kind: "word", context: "General", text: "وش رايك؟", note: "Replaces Egyptian 'إيه رأيك؟'." },
  { id: "s3", dialect: "saudi", kind: "word", context: "Retail", text: "الحين", note: "Means 'now' — avoid Egyptian 'دلوقتي'." },
  { id: "s4", dialect: "saudi", kind: "word", context: "General", text: "يبيلك", note: "'You need' — natural in Najdi/Hejazi casual tone." },
  { id: "s5", dialect: "saudi", kind: "hook", context: "Offers", text: "لا يفوتك العرض!", note: "Classic Saudi CTA, fits Ramadan & national day." },
  { id: "s6", dialect: "saudi", kind: "hook", context: "Food", text: "طعم يرجّعك للسالفة الحلوة", note: "Warm, nostalgic tone." },
  { id: "s7", dialect: "saudi", kind: "hook", context: "Tech", text: "سهّلها على نفسك", note: "Short, direct; works in app copy." },
  { id: "s8", dialect: "saudi", kind: "campaign", context: "National Day", text: "همّة حتى القمّة", note: "Echoes official national slogan — use respectfully." },
  { id: "s9", dialect: "saudi", kind: "campaign", context: "Ramadan", text: "رمضان يجمعنا", note: "Family-first framing performs well." },
  { id: "i1", dialect: "iraqi", kind: "word", context: "General", text: "شلونك؟", note: "Iraqi 'how are you' — never 'إزيك'." },
  { id: "i2", dialect: "iraqi", kind: "word", context: "Food", text: "كلّش طيّب", note: "'كلّش' = very; 'طيّب' = tasty." },
  { id: "i3", dialect: "iraqi", kind: "word", context: "Retail", text: "هسّه", note: "Means 'now'." },
  { id: "i4", dialect: "iraqi", kind: "word", context: "General", text: "شكو ماكو", note: "'What's new' — friendly, youthful." },
  { id: "i5", dialect: "iraqi", kind: "word", context: "General", text: "أريد / تريد", note: "Iraqi 'want' — avoid Egyptian 'عايز'." },
  { id: "i6", dialect: "iraqi", kind: "hook", context: "Offers", text: "لحگ روحك، العرض ما يدوم!", note: "Urgency with Iraqi 'گ' sound." },
  { id: "i7", dialect: "iraqi", kind: "hook", context: "Food", text: "طعم البيت بكل لقمة", note: "Home-cooking nostalgia lands well." },
  { id: "i8", dialect: "iraqi", kind: "campaign", context: "Ramadan", text: "سفرتنا تجمع الأهل", note: "Family table imagery." },
  { id: "i9", dialect: "iraqi", kind: "campaign", context: "Telecom", text: "خلّي الكل يحچي وياك", note: "'يحچي' = talks, very local." },
];

export interface WeekStat { week: string; before: number; withNabra: number | null }

// Average rounds of amends per piece of copy (sample data).
export const AMENDS: WeekStat[] = [
  { week: "W1", before: 4.2, withNabra: null },
  { week: "W2", before: 3.9, withNabra: null },
  { week: "W3", before: 4.1, withNabra: 2.8 },
  { week: "W4", before: 4.0, withNabra: 2.3 },
  { week: "W5", before: 3.8, withNabra: 1.9 },
  { week: "W6", before: 4.3, withNabra: 1.6 },
];
