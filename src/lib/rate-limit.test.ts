import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to the limit then blocks", () => {
    const key = "test:limit";
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(true);
    expect(rateLimit(key, 2, 1000)).toBe(false);
  });

  it("resets after the window", () => {
    const key = "test:reset";
    expect(rateLimit(key, 1, 1000)).toBe(true);
    expect(rateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000)).toBe(true);
  });

  it("tracks keys independently", () => {
    expect(rateLimit("test:a", 1, 1000)).toBe(true);
    expect(rateLimit("test:b", 1, 1000)).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown'", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
