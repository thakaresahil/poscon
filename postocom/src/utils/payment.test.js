import { formatCardNumber, formatExpiry, getCardBrand, isValidCardNumber } from "./payment";

describe("card helpers", () => {
  test("validates card numbers with the Luhn check", () => {
    expect(isValidCardNumber("4242 4242 4242 4242")).toBe(true);
    expect(isValidCardNumber("4242 4242 4242 4241")).toBe(false);
    expect(isValidCardNumber("4242")).toBe(false);
  });

  test("groups card numbers in fours", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatCardNumber("4242-42ab42")).toBe("4242 4242");
  });

  test("adds the slash to expiry dates", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("1230")).toBe("12/30");
    expect(formatExpiry("12/305")).toBe("12/30");
  });

  test("detects the card brand", () => {
    expect(getCardBrand("4242")).toBe("Visa");
    expect(getCardBrand("5555")).toBe("Mastercard");
    expect(getCardBrand("6522")).toBe("RuPay");
    expect(getCardBrand("9999")).toBe("");
  });
});
