import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  dialect: z.enum(["saudi", "iraqi"]),
  brand: z.string().max(200),
  tone: z.string().max(100),
  idea: z.string().min(3).max(3000),
  references: z.array(z.string().max(300)).max(40),
});

export interface GeneratedCopy {
  copy: string;
  notes: { phrase: string; why: string }[];
}

export const generateCopy = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<GeneratedCopy> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const dialectName = data.dialect === "saudi" ? "Saudi (Gulf) Arabic" : "Iraqi Arabic";
    const prompt = `You are a native ${dialectName} copywriter helping an Egyptian writer.
Rewrite the idea below into strong, catchy marketing copy in authentic ${dialectName}.
Never use Egyptian words or expressions. Use the reference phrases when they fit.
Brand: ${data.brand || "-"}
Tone: ${data.tone}
Reference phrases from the library:
${data.references.map((r) => "- " + r).join("\n")}

Writer's idea:
${data.idea}

Return ONLY JSON: {"copy": "the final copy in Arabic", "notes": [{"phrase": "dialect word used", "why": "short English explanation of why it sounds natural / what Egyptian word it replaces"}]} with 3-6 notes.`;
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        input: [{ role: "user", content: prompt }],
      });
      let text = "";
      for (const item of (res as { output?: unknown[] }).output ?? []) {
        const content = (item as { content?: { type: string; text?: string }[] }).content;
        for (const c of content ?? []) if (c.type === "output_text" && c.text) text += c.text;
      }
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return { copy: text.trim(), notes: [] };
      const parsed = JSON.parse(match[0]) as GeneratedCopy;
      return { copy: String(parsed.copy ?? ""), notes: Array.isArray(parsed.notes) ? parsed.notes : [] };
    } catch (e) {
      if (e instanceof GatewayError) {
        if (e.httpStatus === 402) throw new Error("AI credits are used up. Please top up and try again.");
        if (e.httpStatus === 429) throw new Error("Too many requests right now. Please wait a moment.");
      }
      throw new Error("Could not generate copy. Please try again.");
    }
  });
