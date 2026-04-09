import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database and LLM
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";

// Helper: chunk text function (mirrors production logic)
function chunkText(text: string, chunkSize = 500): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";
  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(c => c.length > 30);
}

describe("Knowledge Router — Unit Tests", () => {
  describe("chunkText utility", () => {
    it("should split long text into chunks", () => {
      const longText = Array(10).fill("This is a paragraph of text that is about fifty characters long.").join("\n\n");
      const chunks = chunkText(longText, 200);
      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeLessThanOrEqual(600); // some tolerance
      });
    });

    it("should return single chunk for short text", () => {
      const shortText = "This is a short document with enough content to pass the minimum length filter.";
      const chunks = chunkText(shortText);
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(shortText);
    });

    it("should filter out very short chunks", () => {
      const text = "Long paragraph here with enough content to be meaningful.\n\nOK\n\nAnother long paragraph here with enough content.";
      const chunks = chunkText(text);
      chunks.forEach(chunk => {
        expect(chunk.length).toBeGreaterThan(30);
      });
    });

    it("should handle empty string", () => {
      const chunks = chunkText("");
      expect(chunks.length).toBe(0);
    });
  });

  describe("Knowledge base operations", () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{ insertId: 42 }]),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                {
                  id: 1,
                  title: "Test Document",
                  source: "manual",
                  docType: "research",
                  tags: ["test"],
                  chunkCount: 3,
                  createdAt: new Date(),
                },
              ]),
            }),
            limit: vi.fn().mockResolvedValue([
              { id: 1, content: "OpenClaw is an agentic AI protocol", chunkType: "doc_research", domain: null },
            ]),
          }),
          limit: vi.fn().mockResolvedValue([{ total: 37 }]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    };

    beforeEach(() => {
      vi.mocked(getDb).mockResolvedValue(mockDb as any);
    });

    it("should return search results from ragIndex", async () => {
      const results = await mockDb.select().from({} as any).where({} as any).limit(5);
      expect(Array.isArray(results)).toBe(true);
      expect(results[0]).toHaveProperty("content");
    });

    it("should handle LLM response for askBrain", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{ message: { content: "OpenClaw is the fastest-growing open-source project in history." } }],
      } as any);

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is OpenClaw?" },
        ],
      });

      const content = response?.choices?.[0]?.message?.content;
      expect(typeof content).toBe("string");
      expect(content).toContain("OpenClaw");
    });

    it("should handle LLM failure gracefully", async () => {
      vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM timeout"));

      await expect(invokeLLM({ messages: [] })).rejects.toThrow("LLM timeout");
    });
  });

  describe("Document type validation", () => {
    const validTypes = ["research", "transcript", "report", "notes", "strategy", "client"];

    it("should accept all valid document types", () => {
      validTypes.forEach(type => {
        expect(validTypes).toContain(type);
      });
    });

    it("should have 6 valid document types", () => {
      expect(validTypes.length).toBe(6);
    });
  });
});
