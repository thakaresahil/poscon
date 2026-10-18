import { useState } from "react";
import { Link } from "react-router-dom";
import AuthDialog from "./AuthDialog";

// This demo store does not send email, so the dialog explains what to do instead
function ForgotPassword({ open, handleClose, handleLoginComponent }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlesubmit = (event) => {
    event.preventDefault();
    if (email.includes("@")) {
      setSubmitted(true);
    }
  };

  return (
    <AuthDialog open={open} onClose={handleClose} title="Reset Password">
      {submitted ? (
        <div className="flex flex-col gap-4">
          <p>
            Password reset emails are not sent in this demo store. If you created an account and
            forgot the password, sign up again with a different email, or use the demo account.
          </p>
          <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            Demo account: <span className="font-medium text-gray-900">demo@poscon.dev</span> /{" "}
            <span className="font-medium text-gray-900">demo1234</span>
          </p>
          <button type="button" className="btn btn-primary w-full" onClick={handleLoginComponent}>
            Back to Log In
          </button>
          <p className="text-center text-sm text-gray-600">
            Still stuck?{" "}
            <Link to="/contact" className="link" onClick={handleClose}>Contact us</Link>
          </p>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handlesubmit}>
          <p className="muted">Enter the email you signed up with.</p>
          <div>
            <label htmlFor="forgot-email" className="label">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="input"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Continue</button>
          <button type="button" className="link text-sm" onClick={handleLoginComponent}>
            Back to Log In
          </button>
        </form>
      )}
    </AuthDialog>
  );
}

export default ForgotPassword;
