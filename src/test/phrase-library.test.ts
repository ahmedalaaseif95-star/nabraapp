import { describe, expect, it } from "vitest";
import { LIBRARY, SOURCES, filterLibrary, isNativeReviewed, type LibraryEntry } from "@/lib/nabra-data";

describe("Dialect library provenance", () => {
  const entry: LibraryEntry = { id: "test", dialect: "saudi", kind: "word", text: "الحين", context: "General", note: "Now" };

  it("never treats a source alone as native-speaker review", () => {
    expect(isNativeReviewed({ ...entry, sourceId: "dictionary" })).toBe(false);
  });

  it("requires documented review by a speaker of the target dialect", () => {
    const nativeReview = { reviewer: "Named reviewer", dialect: "saudi" as const, date: "2026-10-24", evidenceUrl: "https://example.org/review" };
    expect(isNativeReviewed({ ...entry, nativeReview })).toBe(true);
    expect(isNativeReviewed({ ...entry, nativeReview: { ...nativeReview, dialect: "iraqi" } })).toBe(false);
    expect(isNativeReviewed({ ...entry, nativeReview: { ...nativeReview, evidenceUrl: "" } })).toBe(false);
  });

  it("replaces the demo set with at least 50 source-linked entries per dialect", () => {
    for (const dialect of ["saudi", "iraqi"]) {
      const entries = LIBRARY.filter((item) => item.dialect === dialect);
      expect(entries.length).toBeGreaterThanOrEqual(50);
      expect(entries.every((item) => item.sourceId && SOURCES[item.sourceId] && item.meaning)).toBe(true);
    }
    expect(new Set(LIBRARY.map((item) => item.id)).size).toBe(LIBRARY.length);
  });

  it("keeps unreviewed entries out of the native-reviewed filter", () => {
    const filtered = filterLibrary(LIBRARY, { query: "", kind: "all", status: "reviewed" });
    expect(filtered.every(isNativeReviewed)).toBe(true);
    expect(filterLibrary([entry], { query: "", kind: "all", status: "reviewed" })).toEqual([]);
  });

  it("finds Arabic phrases regardless of diacritics", () => {
    const phrase = { ...entry, text: "مرّة", meaning: "Very" };
    expect(filterLibrary([phrase], { query: "مرة", kind: "word", status: "all" })).toEqual([phrase]);
    expect(filterLibrary([phrase], { query: "very", kind: "phrase", status: "all" })).toEqual([]);
  });
});