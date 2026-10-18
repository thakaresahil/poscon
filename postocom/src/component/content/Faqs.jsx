import { Link } from "react-router-dom";
import ContentPage from "./ContentPage";

const groups = [
  {
    title: "Orders",
    items: [
      ["How do I place an order?", "Add products to your cart, open the cart and choose Checkout. Enter your delivery address, pick a payment method and confirm. You need an account to check out."],
      ["Can I change the quantity or remove items before ordering?", "Yes. In your cart, use the + and - buttons to change quantities or Remove to take an item out."],
      ["Where can I see my orders?", <>Open <Link to="/orders" className="link">My Orders</Link> from the menu. Each order shows its items, total, payment and delivery status.</>],
      ["Can I cancel an order?", <>Contact us before the order is shipped and we will cancel it. You can reach us from the <Link to="/contact" className="link">Contact</Link> page.</>],
    ],
  },
  {
    title: "Payments",
    items: [
      ["Which payment methods do you accept?", "Cards, UPI and cash on delivery."],
      ["Is my card charged?", "No. Poscon is a demo store and payments are simulated. No money is taken, and only the card brand and last four digits are stored."],
      ["My payment was declined. What now?", "The order stays saved as unpaid. Open it from My Orders and choose Pay Now to try again or pick another method."],
    ],
  },
  {
    title: "Delivery & Returns",
    items: [
      ["How much is delivery?", "Delivery is free on every order."],
      ["How long does delivery take?", <>Usually 3 to 7 working days depending on your city. See <Link to="/shipping-returns" className="link">Shipping & Returns</Link> for details.</>],
      ["What is your return policy?", "Unused items with tags can be returned within 7 days of delivery for a full refund."],
    ],
  },
  {
    title: "Account",
    items: [
      ["How do I update my address or phone number?", <>Open <Link to="/profile" className="link">My Account</Link> and edit your details. Your saved address is filled in for you at checkout.</>],
      ["I forgot my password.", "This demo store does not send reset emails. You can create a new account with a different email, or use the demo account demo@poscon.dev with the password demo1234."],
    ],
  },
];

function Faqs() {
  return (
    <ContentPage eyebrow="Help" title="Frequently Asked Questions" intro="Answers to the questions we hear most often.">
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{group.title}</h2>
          <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {group.items.map(([question, answer]) => (
              <details key={question} className="group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {question}
                  <span className="text-xl text-gray-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="muted mt-3">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="muted">
        Didn't find your answer? <Link to="/contact" className="link">Send us a message</Link>.
      </p>
    </ContentPage>
  );
}

export default Faqs;
