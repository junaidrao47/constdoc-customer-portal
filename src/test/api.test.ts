import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiError, configureApiTokens } from "@/lib/api";

describe("customer API client", () => {
  beforeEach(() => {
    configureApiTokens(null);
    vi.restoreAllMocks();
  });

  it("turns structured validation errors into a readable message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: false,
            error: "Validation failed",
            details: { fieldErrors: { email: ["Enter a valid email address."] } },
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );
    await expect(apiRequest("/auth/login", { method: "POST", body: "{}" })).rejects.toEqual(
      expect.objectContaining<Pick<ApiError, "message" | "status">>({
        message: "email: Enter a valid email address.",
        status: 400,
      }),
    );
  });

  it("uses the API data envelope for successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { status: "ok" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(apiRequest<{ status: string }>("/health")).resolves.toEqual({ status: "ok" });
  });
});
