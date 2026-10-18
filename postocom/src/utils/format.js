export const formatOrderNumber = (id) => `#${String(id).padStart(6, "0")}`;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const orderStatusLabels = {
  placed: "Placed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const orderStatusStyles = {
  placed: "bg-blue-100 text-blue-700",
  shipped: "bg-yellow-100 text-yellow-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};

export const paymentStatusLabels = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  cod: "Cash on Delivery",
};

export const paymentStatusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cod: "bg-gray-200 text-gray-700",
};

export const paymentMethodLabels = {
  card: "Card",
  upi: "UPI",
  cod: "Cash on Delivery",
};

export const needsPayment = (paymentStatus) =>
  paymentStatus === "pending" || paymentStatus === "failed";
