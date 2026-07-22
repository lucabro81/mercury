import { describe, it, expect } from "bun:test";
import { createSemanticFactExtractor, normalizeTopic, type SemanticFact } from "./semantic-fact-extractor.ts";
import type { LanguageModel } from "ai";
import type { Message } from "./history.ts";

const MODEL = "fake-model" as unknown as LanguageModel;

const MESSAGES: Message[] = [
  { role: "user", content: "preferisco che le risposte siano in italiano" },
  { role: "assistant", content: "ok, risponderò in italiano" },
];

describe("createSemanticFactExtractor", () => {
  it("returns the facts produced by generateObjectFn", async () => {
    const facts: SemanticFact[] = [{ topic: "preferred-language", value: "italiano" }];
    const generateObjectFn = async () => ({ object: facts });

    const extract = createSemanticFactExtractor(MODEL, generateObjectFn);
    const result = await extract(MESSAGES);

    expect(result).toEqual(facts);
  });

  it("passes the model and the joined messages through unchanged", async () => {
    let received: { model: LanguageModel; prompt: string } | undefined;
    const generateObjectFn = async (params: { model: LanguageModel; prompt: string }) => {
      received = params;
      return { object: [] };
    };

    const extract = createSemanticFactExtractor(MODEL, generateObjectFn);
    await extract(MESSAGES);

    expect(received?.model).toBe(MODEL);
    expect(received?.prompt).toContain("preferisco che le risposte siano in italiano");
    expect(received?.prompt).toContain("ok, risponderò in italiano");
  });

  it("returns an empty array when nothing qualifies", async () => {
    const generateObjectFn = async () => ({ object: [] });

    const extract = createSemanticFactExtractor(MODEL, generateObjectFn);
    const result = await extract(MESSAGES);

    expect(result).toEqual([]);
  });

  // The system prompt is what keeps this from extracting one-off task
  // details as if they were standing facts about the user.
  it("instructs the model to extract only stable, standing facts — not one-off task details", async () => {
    let received: { system: string } | undefined;
    const generateObjectFn = async (params: { system: string }) => {
      received = params;
      return { object: [] };
    };

    const extract = createSemanticFactExtractor(MODEL, generateObjectFn);
    await extract(MESSAGES);

    expect(received?.system.toLowerCase()).toMatch(/stabil|ricorrent|preferenz/);
  });

  // Clustering (next unit) groups facts by userId+topic — inconsistent
  // casing/formatting from the LLM ("Team" vs "team" vs "il team") would
  // silently defeat that grouping, so topics are normalized deterministically
  // in code rather than trusted to the model's formatting.
  it("normalizes each fact's topic but leaves value untouched", async () => {
    const generateObjectFn = async () => ({ object: [{ topic: "Preferred Language", value: "Italiano" }] });

    const extract = createSemanticFactExtractor(MODEL, generateObjectFn);
    const result = await extract(MESSAGES);

    expect(result).toEqual([{ topic: "preferred-language", value: "Italiano" }]);
  });
});

describe("normalizeTopic", () => {
  it("lowercases and trims surrounding whitespace", () => {
    expect(normalizeTopic("  Preferred Language  ")).toBe("preferred-language");
  });

  it("replaces spaces and underscores with hyphens", () => {
    expect(normalizeTopic("preferred_language")).toBe("preferred-language");
  });

  it("collapses repeated separators into a single hyphen", () => {
    expect(normalizeTopic("preferred   language__team")).toBe("preferred-language-team");
  });
});
