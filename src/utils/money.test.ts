import { describe, expect, it } from "vitest";

import { formatCents, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses whole dollars and decimal amounts into cents", () => {
    expect(parseAmountToCents("10")).toBe(1000);
    expect(parseAmountToCents("10.5")).toBe(1050);
    expect(parseAmountToCents("10.99")).toBe(1099);
    expect(parseAmountToCents("  25.00  ")).toBe(2500);
  });

  it("rejects invalid or non-positive amounts", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("0")).toBeNull();
    expect(parseAmountToCents("-1")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
    expect(parseAmountToCents("10.999")).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats cents as dollar amounts", () => {
    expect(formatCents(0)).toBe("$0.00");
    expect(formatCents(1099)).toBe("$10.99");
    expect(formatCents(100000)).toBe("$1,000.00");
    expect(formatCents(-5000)).toBe("-$50.00");
  });
});
