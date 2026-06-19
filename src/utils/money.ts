const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();

  if (!AMOUNT_PATTERN.test(trimmed)) {
    return null;
  }

  const [dollarsPart, centsPart = ""] = trimmed.split(".");
  const dollars = Number(dollarsPart);
  const cents = Number(centsPart.padEnd(2, "0"));
  const amountCents = dollars * 100 + cents;

  return amountCents > 0 ? amountCents : null;
}

export function formatCents(amountCents: number): string {
  const sign = amountCents < 0 ? "-" : "";
  const absoluteCents = Math.abs(amountCents);
  const dollars = Math.floor(absoluteCents / 100);
  const cents = absoluteCents % 100;

  return `${sign}$${dollars.toLocaleString("en-US")}.${cents.toString().padStart(2, "0")}`;
}
