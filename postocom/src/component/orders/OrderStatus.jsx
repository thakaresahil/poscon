import { orderStatusLabels, orderStatusStyles } from "../../utils/format";

function OrderStatus({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm ${orderStatusStyles[status] || ""}`}>
      {orderStatusLabels[status] || status}
    </span>
  );
}

export default OrderStatus;
