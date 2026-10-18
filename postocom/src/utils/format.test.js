import { formatOrderNumber, needsPayment } from "./format";

test("pads order numbers to six digits", () => {
  expect(formatOrderNumber(7)).toBe("#000007");
  expect(formatOrderNumber(1234567)).toBe("#1234567");
});

test("only pending and failed orders need payment", () => {
  expect(needsPayment("pending")).toBe(true);
  expect(needsPayment("failed")).toBe(true);
  expect(needsPayment("paid")).toBe(false);
  expect(needsPayment("cod")).toBe(false);
});
