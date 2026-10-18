import { Link } from "react-router-dom";
import ContentPage, { Section } from "./ContentPage";

function Terms() {
  return (
    <ContentPage title="Terms of Use" updated="October 2026" intro="The rules for using the Poscon store.">
      <Section title="A demo store">
        <p>Poscon is a demonstration project. Products are not shipped, and payments are simulated: no money is taken from any card or UPI account. Please do not enter real card details.</p>
      </Section>
      <Section title="Your account">
        <p>You are responsible for keeping your password private and for activity on your account. Use a real email address you can access, and do not create accounts for other people without their permission.</p>
      </Section>
      <Section title="Prices and products">
        <p>Prices are shown in Indian rupees and include all taxes. We try to describe every product accurately; product images are illustrations and colours may vary slightly.</p>
      </Section>
      <Section title="Orders">
        <p>Placing an order is an offer to buy. An order is confirmed once payment succeeds or cash on delivery is chosen. We may cancel an order if a product is unavailable or a price was shown incorrectly, and we will refund any payment.</p>
      </Section>
      <Section title="Returns">
        <p>Returns follow our <Link to="/shipping-returns" className="link">Shipping & Returns</Link> policy.</p>
      </Section>
      <Section title="Acceptable use">
        <p>Do not try to access other customers' data, disrupt the service, or send automated requests beyond normal use.</p>
      </Section>
      <Section title="Questions">
        <p>Questions about these terms? <Link to="/contact" className="link">Contact us</Link>.</p>
      </Section>
    </ContentPage>
  );
}

export default Terms;
