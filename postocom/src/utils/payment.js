// Card helpers used by the demo payment form

export const TEST_CARDS = [
  { number: "4242 4242 4242 4242", result: "Payment succeeds" },
  { number: "4000 0000 0000 0002", result: "Card declined" },
  { number: "4000 0000 0000 9995", result: "Insufficient funds" },
];

export const TEST_UPI = [
  { id: "demo@okaxis", result: "Payment succeeds" },
  { id: "fail@upi", result: "Payment declined" },
];

export const isValidCardNumber = (value) => {
  const number = value.replace(/\D/g, "");
  if (number.length < 12 || number.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
};

export const formatCardNumber = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export const getCardBrand = (value) => {
  const number = value.replace(/\D/g, "");
  if (/^4/.test(number)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "Amex";
  if (/^(60|65|81|82|508)/.test(number)) return "RuPay";
  return "";
};
