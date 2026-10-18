import { describe, expect, test } from "@jest/globals";
import {
  chargePayment,
  getCardBrand,
  isExpiryInFuture,
  isValidCardNumber,
} from "../src/utils/mockPayment.js";

describe("isValidCardNumber", () => {
  test.each(["4242424242424242", "5555555555554444", "4000000000000002"])(
    "accepts %s",
    (number) => {
      expect(isValidCardNumber(number)).toBe(true);
    }
  );

  test.each(["4242424242424241", "1234", "abcd1234abcd1234", ""])("rejects %s", (number) => {
    expect(isValidCardNumber(number)).toBe(false);
  });
});

describe("isExpiryInFuture", () => {
  const now = new Date(2026, 9, 18); // 18 Oct 2026

  test("accepts the current month", () => {
    expect(isExpiryInFuture("10/26", now)).toBe(true);
  });

  test("accepts a later year", () => {
    expect(isExpiryInFuture("01/30", now)).toBe(true);
  });

  test("rejects last month", () => {
    expect(isExpiryInFuture("09/26", now)).toBe(false);
  });
});

describe("getCardBrand", () => {
  test.each([
    ["4242424242424242", "Visa"],
    ["5555555555554444", "Mastercard"],
    ["378282246310005", "Amex"],
    ["6522941234567890", "RuPay"],
    ["9999999999999995", "Card"],
  ])("%s is %s", (number, brand) => {
    expect(getCardBrand(number)).toBe(brand);
  });
});

describe("chargePayment", () => {
  test("succeeds with a transaction id", () => {
    const result = chargePayment({ method: "card", card: { number: "4242424242424242" } });
    expect(result.success).toBe(true);
    expect(result.transactionId).toMatch(/^TXN[0-9A-F]{12}$/);
  });

  test("declines the decline test card", () => {
    const result = chargePayment({ method: "card", card: { number: "4000000000000002" } });
    expect(result).toEqual({ success: false, reason: "Your card was declined by the bank" });
  });

  test("declines the failing UPI id", () => {
    expect(chargePayment({ method: "upi", upiId: "fail@upi" }).success).toBe(false);
  });
});
