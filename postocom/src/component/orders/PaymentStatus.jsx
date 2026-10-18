import { paymentStatusLabels, paymentStatusStyles } from "../../utils/format";

function PaymentStatus({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${paymentStatusStyles[status] || ""}`}>
      {paymentStatusLabels[status] || status}
    </span>
  );
}

export default PaymentStatus;
