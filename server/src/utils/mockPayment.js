import crypto from "crypto";

// Simulated payment gateway for the demo. No real money is moved.

// Test card numbers that are always declined, with the reason shown to the user
export const DECLINED_CARDS = {
  "4000000000000002": "Your card was declined by the bank",
  "4000000000009995": "Insufficient funds on this card",
};

export const DECLINED_UPI_ID = "fail@upi";

export const isValidCardNumber = (number) => {
  if (!/^\d{12,19}$/.test(number)) return false;
  // Luhn checksum
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

export const isExpiryInFuture = (expiry, now = new Date()) => {
  const [month, year] = expiry.split("/").map(Number);
  const fullYear = 2000 + year;
  return (
    fullYear > now.getFullYear() ||
    (fullYear === now.getFullYear() && month >= now.getMonth() + 1)
  );
};

export const getCardBrand = (number) => {
  if (/^4/.test(number)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "Amex";
  if (/^(60|65|81|82|508)/.test(number)) return "RuPay";
  return "Card";
};

const createTransactionId = () =>
  `TXN${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

// Returns { success, transactionId } or { success: false, reason }
export const chargePayment = ({ method, card, upiId }) => {
  if (method === "card" && DECLINED_CARDS[card.number]) {
    return { success: false, reason: DECLINED_CARDS[card.number] };
  }
  if (method === "upi" && upiId === DECLINED_UPI_ID) {
    return { success: false, reason: "The UPI payment request was declined" };
  }
  return { success: true, transactionId: createTransactionId() };
};
