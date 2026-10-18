import { Link } from "react-router-dom";
import ContentPage, { Section } from "./ContentPage";

function ShippingReturns() {
  return (
    <ContentPage eyebrow="Help" title="Shipping & Returns" intro="Free delivery on every order and easy returns within 7 days.">
      <Section title="Delivery">
        <p>Delivery is free on all orders, with no minimum order value. We deliver across India.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-4">Location</th>
                <th className="py-2">Estimated delivery</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100"><td className="py-2 pr-4">Metro cities</td><td className="py-2">3 to 4 working days</td></tr>
              <tr className="border-b border-gray-100"><td className="py-2 pr-4">Other cities and towns</td><td className="py-2">4 to 6 working days</td></tr>
              <tr><td className="py-2 pr-4">Remote areas</td><td className="py-2">Up to 7 working days</td></tr>
            </tbody>
          </table>
        </div>
        <p>You can follow each order's status (placed, shipped, delivered) from <Link to="/orders" className="link">My Orders</Link>.</p>
      </Section>
      <Section title="Returns">
        <p>If something isn't right, you can return it within 7 days of delivery. Items must be unused, with the original tags attached.</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Earrings and other jewellery cannot be returned for hygiene reasons.</li>
          <li>Refunds go back to the original payment method within 5 to 7 working days of us receiving the item.</li>
          <li>For cash on delivery orders, we refund to your bank account.</li>
        </ul>
      </Section>
      <Section title="How to start a return">
        <p>Send us a message from the <Link to="/contact" className="link">Contact</Link> page with your order number, the item and the reason. We will reply with pickup details.</p>
      </Section>
      <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
        Poscon is a demo store, so orders are not actually shipped. This page shows how a real store would describe its policy.
      </p>
    </ContentPage>
  );
}

export default ShippingReturns;
