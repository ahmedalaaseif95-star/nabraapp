import { describe, expect, it } from "vitest";
import { toSegment, previewRows, chunk } from "@/lib/sada-import";

describe("SADA import rules", () => {
  it("is never commercially usable", () => {
    const s = toSegment({ FileName: "a/b.wav", SegmentID: "1", GroundTruthText: "هلا", SpeakerDialect: "Najdi" }, "u");
    expect(s.commercial_use_allowed).toBe(false);
    expect(s.license).toBe("CC BY-NC-SA 4.0");
  });
  it("does not treat Khaliji as Saudi and flags it uncertain", () => {
    const s = toSegment({ FileName: "a", SegmentID: "1", SpeakerDialect: "Khaliji", GroundTruthText: "x" }, "u");
    expect(s.speaker_dialect).toBe("Khaliji");
    expect(s.flag_uncertain_dialect).toBe(true);
  });
  it("keeps original text unchanged and flags empty text", () => {
    expect(toSegment({ FileName: "a", SegmentID: "1", GroundTruthText: "أهلاً!" }, "u").ground_truth_text).toBe("أهلاً!");
    expect(toSegment({ FileName: "a", SegmentID: "1", GroundTruthText: " " }, "u").flag_empty_text).toBe(true);
  });
  it("previews only Najdi/Hijazi, max 100", () => {
    const rows = Array.from({ length: 300 }, (_, i) => ({ SpeakerDialect: ["Najdi", "Khaliji", "Hijazi"][i % 3] }));
    const p = previewRows(rows);
    expect(p).toHaveLength(100);
    expect(p.every((r) => r.SpeakerDialect !== "Khaliji")).toBe(true);
  });
  it("batches", () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]));
});
