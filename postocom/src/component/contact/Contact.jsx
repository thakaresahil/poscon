import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const details = [
  ["Email", "support@poscon.dev"],
  ["Phone", "+91 22 4000 1234"],
  ["Hours", "Monday to Saturday, 10am to 7pm"],
  ["Address", "Poscon, 4th Floor, Linking Road, Bandra West, Mumbai 400050"],
];

const emptyForm = { name: "", email: "", subject: "", message: "" };

function Contact() {
  const { isLoggedIn } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Fill in the name and email for logged-in customers
  useEffect(() => {
    if (!isLoggedIn) return;
    api
      .get("/profile")
      .then((response) =>
        setForm((current) => ({
          ...current,
          name: current.name || response.data.name || "",
          email: current.email || response.data.email || "",
        }))
      )
      .catch(() => {});
  }, [isLoggedIn]);

  const handlechange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handlesubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setSending(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.error || "Could not send your message, please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page my-12">
      <div className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title mt-1">We're here to help</h1>
        <p className="muted mt-3 text-lg">
          Questions about an order, a return or a product? Send us a message and we'll reply within one working day.
          You might also find your answer in the <Link to="/faqs" className="link">FAQs</Link>.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section className="card p-6" aria-labelledby="contact-form-title">
          <h2 id="contact-form-title" className="text-xl font-semibold">Send a message</h2>
          {sent ? (
            <div className="mt-6 flex flex-col items-start gap-4" role="status">
              <p className="rounded-md bg-green-50 p-4 text-green-800">
                Thanks, your message has been sent. We'll get back to you by email.
              </p>
              <button className="btn btn-secondary" onClick={() => setSent(false)}>Send another message</button>
            </div>
          ) : (
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handlesubmit} noValidate>
              <div>
                <label htmlFor="contact-name" className="label">Name</label>
                <input id="contact-name" name="name" className="input" autoComplete="name" value={form.name} onChange={handlechange} />
              </div>
              <div>
                <label htmlFor="contact-email" className="label">Email</label>
                <input id="contact-email" name="email" type="email" className="input" autoComplete="email" value={form.email} onChange={handlechange} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-subject" className="label">Subject <span className="font-normal text-gray-500">(optional)</span></label>
                <input id="contact-subject" name="subject" className="input" placeholder="e.g. Order #000012" value={form.subject} onChange={handlechange} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="contact-message" className="label">Message</label>
                <textarea id="contact-message" name="message" rows="6" className="input" value={form.message} onChange={handlechange} />
                <p className="mt-1 text-right text-xs text-gray-500">{form.message.length} / 2000</p>
              </div>
              {error && <p className="field-error sm:col-span-2" role="alert">{error}</p>}
              <div className="sm:col-span-2">
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <dl className="card divide-y divide-gray-200">
            {details.map(([label, value]) => (
              <div key={label} className="p-4">
                <dt className="text-sm font-medium text-gray-500">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-gray-500">
            Poscon is a demo store; the contact details above are examples. Messages sent with this form are saved and
            visible to the store admin.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Contact;
