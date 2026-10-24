import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Dialect } from "./nabra-data";
import type { GeneratedCopy } from "./generate.functions";

export type Lang = "en" | "ar";

export interface Draft {
  dialect: Dialect;
  brand: string;
  tone: string;
  idea: string;
  selected: string[];
}

export interface Approved { id: string; date: string; dialect: Dialect; brand: string; copy: string; amends: number }

const dict = {
  en: {
    nav_write: "Write", nav_result: "Review", nav_dash: "Dashboard",
    tagline: "Strong copy, in the right dialect.",
    sub: "Write your idea in any Arabic. Nabra turns it into native Saudi or Iraqi copy.",
    dialect: "Target dialect", saudi: "Saudi", iraqi: "Iraqi",
    brand: "Brand", tone: "Tone of voice", idea: "What's on your mind?",
    idea_ph: "e.g. عايزين نقول للناس إن الأكل عندنا حلو أوي وفيه خصم النهارده",
    library: "Phrase library", library_hint: "Pick words, hooks & past campaigns to guide the AI.",
    word: "Word", hook: "Hook", campaign: "Campaign",
    sample: "Use sample", generate: "Generate copy", generating: "Writing…",
    result: "Review the copy", result_hint: "Edit freely. Nothing is used until a person approves it.",
    why: "Why these words", amends: "Rounds of amends expected", approve: "Approve copy",
    approved: "Approved — logged to dashboard", copy_btn: "Copy", copied: "Copied",
    regenerate: "Regenerate", empty: "No copy yet.", start: "Start writing",
    dash: "Rounds of amends", dash_hint: "Average rounds per piece of copy, week by week (sample data).",
    before: "Before Nabra", with: "With Nabra", drop: "fewer amends", approvedList: "Approved this session",
    none: "Nothing approved yet.", toneOpts: ["Friendly", "Bold", "Luxury", "Playful", "Formal"],
  },
  ar: {
    nav_write: "اكتب", nav_result: "المراجعة", nav_dash: "لوحة المتابعة",
    tagline: "كوبي قوي، باللهجة الصح.",
    sub: "اكتب فكرتك بأي لهجة عربية، ونبرة تحوّلها لكوبي سعودي أو عراقي أصيل.",
    dialect: "اللهجة المستهدفة", saudi: "سعودي", iraqi: "عراقي",
    brand: "البراند", tone: "نبرة الصوت", idea: "إيه اللي في بالك؟",
    idea_ph: "مثال: عايزين نقول للناس إن الأكل عندنا حلو أوي وفيه خصم النهارده",
    library: "مكتبة العبارات", library_hint: "اختار كلمات وهوكات وحملات ناجحة توجّه الذكاء الاصطناعي.",
    word: "كلمة", hook: "هوك", campaign: "حملة",
    sample: "استخدم مثال", generate: "اكتب الكوبي", generating: "جاري الكتابة…",
    result: "راجع الكوبي", result_hint: "عدّل براحتك. لا يُستخدم أي شيء قبل موافقة شخص.",
    why: "ليه الكلمات دي", amends: "عدد جولات التعديل المتوقعة", approve: "اعتماد الكوبي",
    approved: "تم الاعتماد — اتسجل في اللوحة", copy_btn: "نسخ", copied: "تم النسخ",
    regenerate: "إعادة التوليد", empty: "لا يوجد كوبي بعد.", start: "ابدأ الكتابة",
    dash: "جولات التعديل", dash_hint: "متوسط الجولات لكل كوبي أسبوعياً (بيانات تجريبية).",
    before: "قبل نبرة", with: "مع نبرة", drop: "تعديلات أقل", approvedList: "المعتمد في هذه الجلسة",
    none: "لم يُعتمد شيء بعد.", toneOpts: ["ودود", "جريء", "فاخر", "مرح", "رسمي"],
  },
};
export type Dict = (typeof dict)["en"];

interface Ctx {
  lang: Lang; setLang: (l: Lang) => void; t: Dict;
  draft: Draft; setDraft: (d: Draft) => void;
  result: GeneratedCopy | null; setResult: (r: GeneratedCopy | null) => void;
  approved: Approved[]; addApproved: (a: Approved) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [draft, setDraft] = useState<Draft>({ dialect: "saudi", brand: "", tone: "Friendly", idea: "", selected: [] });
  const [result, setResult] = useState<GeneratedCopy | null>(null);
  const [approved, setApproved] = useState<Approved[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("nabra-lang");
    if (saved === "ar" || saved === "en") setLang(saved);
    try { setApproved(JSON.parse(localStorage.getItem("nabra-approved") || "[]")); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("nabra-lang", lang);
  }, [lang]);

  const addApproved = (a: Approved) => {
    const next = [a, ...approved];
    setApproved(next);
    localStorage.setItem("nabra-approved", JSON.stringify(next));
  };

  return (
    <AppCtx.Provider value={{ lang, setLang, t: dict[lang], draft, setDraft, result, setResult, approved, addApproved }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
