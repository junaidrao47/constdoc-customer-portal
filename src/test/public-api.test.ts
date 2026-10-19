import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicPackages } from "@/lib/public-api";

/**
 * The contract that matters: a failed read is a failure *value*, never a quietly empty
 * list. The old client returned `[]` for every failure, so a dead API looked exactly
 * like an empty catalogue. Each case below must come back `{ ok: false }` — and in
 * particular must never be `{ ok: true, data: [] }`.
 */
describe("getPublic (via getPublicPackages)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a failure when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await getPublicPackages();

    expect(result.ok).toBe(false);
    expect(result).not.toEqual({ ok: true, data: [] });
    if (!result.ok) {
      expect(result.error).toMatch(/could not be reached/i);
    }
  });

  it("returns a failure on a non-200 response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("upstream error", { status: 503 })),
    );

    const result = await getPublicPackages();

    expect(result.ok).toBe(false);
    expect(result).not.toEqual({ ok: true, data: [] });
    if (!result.ok) {
      expect(result.error).toContain("503");
    }
  });

  it("returns a failure on a 200 whose envelope carries no data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const result = await getPublicPackages();

    expect(result.ok).toBe(false);
    expect(result).not.toEqual({ ok: true, data: [] });
    if (!result.ok) {
      expect(result.error).toMatch(/unexpected response/i);
    }
  });

  it("returns the data on a well-formed 200 (the contrast case)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const result = await getPublicPackages();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual([]);
    }
  });
});
