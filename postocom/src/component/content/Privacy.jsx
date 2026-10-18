import { Link } from "react-router-dom";
import ContentPage, { Section } from "./ContentPage";

function Privacy() {
  return (
    <ContentPage title="Privacy Policy" updated="October 2026" intro="What information Poscon keeps, why, and how it is protected.">
      <Section title="What we store">
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Account details:</strong> your email, phone number, and optionally your name and address.</li>
          <li><strong>Your password</strong>, stored only as a bcrypt hash. Nobody, including us, can read it.</li>
          <li><strong>Cart and orders:</strong> the items you add, the orders you place and their delivery addresses.</li>
          <li><strong>Payments:</strong> the method, result and transaction ID. For cards, only the brand and last four digits. Full card numbers and CVVs are never stored.</li>
          <li><strong>Messages</strong> you send us through the contact form.</li>
        </ul>
      </Section>
      <Section title="How we use it">
        <p>Only to run the store: to log you in, keep your cart, process and show your orders, and reply to your messages. We do not sell your information or use it for advertising.</p>
      </Section>
      <Section title="How it is protected">
        <ul className="list-disc space-y-1 pl-6">
          <li>All traffic uses HTTPS, and the database connection uses SSL.</li>
          <li>Logins use signed tokens that expire after 7 days. Each request checks that you can only see your own cart and orders.</li>
          <li>Login and signup are rate limited to slow down password guessing.</li>
        </ul>
      </Section>
      <Section title="Cookies and local storage">
        <p>Poscon does not use tracking cookies. Your browser keeps your login token in local storage so you stay logged in; logging out removes it.</p>
      </Section>
      <Section title="Your choices">
        <p>You can update your details from <Link to="/profile" className="link">My Account</Link>. To have your account and data deleted, <Link to="/contact" className="link">contact us</Link>.</p>
      </Section>
    </ContentPage>
  );
}

export default Privacy;
