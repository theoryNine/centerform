import { describe, expect, it } from "vitest";
import { formatBytes, MAX_UPLOAD_BYTES, validateImageFile } from "./uploads";

describe("validateImageFile", () => {
  it("accepts supported images up to the limit", () => {
    expect(validateImageFile({ type: "image/jpeg", size: 1000 })).toBeNull();
    expect(validateImageFile({ type: "image/heic", size: MAX_UPLOAD_BYTES })).toBeNull();
  });

  it("rejects SVG and other types", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 100 })).toMatch(/SVG/);
    expect(validateImageFile({ type: "application/pdf", size: 100 })).toMatch(/Unsupported/);
    expect(validateImageFile({ type: "", size: 100 })).toMatch(/Unsupported/);
  });

  it("rejects too-large and empty files", () => {
    expect(validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 })).toMatch(/10 MB/);
    expect(validateImageFile({ type: "image/png", size: 0 })).toMatch(/empty/);
  });
});

describe("formatBytes", () => {
  it("formats sizes", () => {
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(null)).toBe("");
    expect(formatBytes(0)).toBe("");
  });
});
