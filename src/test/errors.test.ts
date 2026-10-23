import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import { messageForError } from "@/lib/errors";

describe("messageForError", () => {
  it("maps document-pipeline codes per locale", () => {
    const locked = new ApiError("x", 409, { code: "DOCUMENT_LOCKED" });
    expect(messageForError(locked, "en")).toMatch(/locked/i);
    expect(messageForError(locked, "es")).toMatch(/bloqueado/i);
  });

  it("maps size and type codes", () => {
    expect(messageForError(new ApiError("", 413, { code: "FILE_TOO_LARGE" }), "en")).toMatch(/25 MB/);
    expect(messageForError(new ApiError("", 415, { code: "FILE_TYPE_NOT_ALLOWED" }), "en")).toMatch(
      /not accepted/i,
    );
  });

  it("falls back to the API message for an unmapped code", () => {
    expect(messageForError(new ApiError("Very specific", 400, { code: "NEW" }), "en")).toBe(
      "Very specific",
    );
  });

  it("uses the localized network fallback for a non-ApiError", () => {
    expect(messageForError(new TypeError("Failed to fetch"), "en")).toMatch(/connect/i);
    expect(messageForError(undefined, "es")).toMatch(/conectar/i);
  });
});
