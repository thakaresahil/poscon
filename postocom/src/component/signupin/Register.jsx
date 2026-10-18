import api from "../../api/client";
import { useState } from "react";
import AuthDialog from "./AuthDialog";
import PasswordInput from "./PasswordInput";

function Register({ open, handleClose, handleLoginComponent }) {
  const [signupdata, setData] = useState({
    email: "",
    pnum: "",
    password: "",
    confirm_password: "",
  });
  const [formError, setFormError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handlechange(event) {
    setData({ ...signupdata, [event.target.name]: event.target.value });
  }

  const handlesubmit = (event) => {
    event.preventDefault();
    setFormError("");
    setAlreadyRegistered(false);

    if (Object.values(signupdata).some((value) => value === "")) {
      setFormError("Please fill out all fields.");
      return;
    }
    if (signupdata.password !== signupdata.confirm_password) {
      setFormError("Passwords do not match.");
      return;
    }

    const { confirm_password, ...newUser } = signupdata;
    setSubmitting(true);
    api
      .post("/signup/user", newUser)
      .then(() => {
        handleLoginComponent();
      })
      .catch((error) => {
        if (error.response?.status === 409) {
          setAlreadyRegistered(true);
        } else {
          setFormError(error.response?.data?.error || "Something went wrong, please try again.");
        }
        setSubmitting(false);
      });
  };

  return (
    <AuthDialog open={open} onClose={handleClose} title="Create Account" subtitle="It takes less than a minute.">
      <form className="flex flex-col gap-4" onSubmit={handlesubmit} noValidate>
        <div>
          <label htmlFor="signup-email" className="label">Email</label>
          <input
            id="signup-email"
            type="email"
            className="input"
            name="email"
            placeholder="Email"
            autoComplete="email"
            onChange={handlechange}
            value={signupdata.email}
          />
        </div>
        <div>
          <label htmlFor="signup-phone" className="label">Phone Number</label>
          <input
            id="signup-phone"
            type="tel"
            inputMode="numeric"
            className="input"
            name="pnum"
            placeholder="Phone Number"
            autoComplete="tel"
            onChange={handlechange}
            value={signupdata.pnum}
          />
        </div>
        <PasswordInput
          id="signup-password"
          name="password"
          label="Password"
          autoComplete="new-password"
          value={signupdata.password}
          onChange={handlechange}
        />
        <PasswordInput
          id="signup-confirm"
          name="confirm_password"
          label="Confirm Password"
          autoComplete="new-password"
          value={signupdata.confirm_password}
          onChange={handlechange}
        />
        <p className="-mt-2 text-sm text-gray-500">At least 8 characters.</p>
        {alreadyRegistered && (
          <p className="field-error" role="alert">
            You already have an account.{" "}
            <button type="button" className="link" onClick={handleLoginComponent}>Log in instead</button>
          </p>
        )}
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button type="button" className="link" onClick={handleLoginComponent}>
            Log in
          </button>
        </p>
      </form>
    </AuthDialog>
  );
}

export default Register;
