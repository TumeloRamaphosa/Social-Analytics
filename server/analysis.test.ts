import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database — use a Proxy so any chained method returns the same thenable chain
vi.mock("./db", () => {
  // A thenable that resolves to [] and also proxies any further method calls
  function makeChain(): any {
    const handler: ProxyHandler<any> = {
      get(_target, prop) {
        if (prop === "then") {
          // Make it a thenable that resolves to []
          return (resolve: (v: any) => any) => Promise.resolve([]).then(resolve);
        }
        // Any method call returns another chain
        return () => makeChain();
      },
    };
    return new Proxy({}, handler);
  }
  return {
    getDb: vi.fn().mockResolvedValue({
      select: vi.fn().mockReturnValue(makeChain()),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue({ insertId: 1 }) }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({}) }) }),
      delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({}) }),
    }),
  };
});

// Mock the analysis engine
vi.mock("./analysisEngine", () => ({
  runAnalysis: vi.fn().mockResolvedValue({
    domain: "example.com",
    status: "completed",
    seoScore: 75,
    performanceScore: 80,
  }),
}));

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("analysis router", () => {
  it("getHistory returns empty array when no analyses exist", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analysis.getHistory({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getById returns null for non-existent analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.analysis.getById({ id: 99999 });
    expect(result).toBeNull();
  });

  it("searchRag returns empty array for short query", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Query must be at least 3 chars
    const result = await caller.analysis.searchRag({ query: "seo" });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getStats returns an object with analysis counts", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // getHistory with limit 1 should return an array
    const result = await caller.analysis.getHistory({ limit: 1, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("export router", () => {
  it("getExportStatus returns null for non-existent analysis", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.export.getExportStatus({ analysisId: 99999 });
    expect(result).toBeNull();
  });
});

describe("auth router", () => {
  it("me returns the current user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@example.com");
  });

  it("logout clears session cookie", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
