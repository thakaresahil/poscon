import api from "../../api/client";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthDialog from "./AuthDialog";
import PasswordInput from "./PasswordInput";

function Login({ open, handleClose, handleRegister }) {
  const { login, openForgotPassword } = useAuth();
  const [logindata, setData] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handlechange(event) {
    setData({ ...logindata, [event.target.name]: event.target.value });
  }

  function handlesubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!logindata.email || !logindata.password) {
      setFormError("Please fill out all fields.");
      return;
    }
    setSubmitting(true);
    api
      .post("/login", logindata)
      .then((response) => {
        login(response.data.token, response.data.uid);
      })
      .catch((error) => {
        setFormError(error.response?.data?.error || "Something went wrong, please try again.");
        setSubmitting(false);
      });
  }

  return (
    <AuthDialog open={open} onClose={handleClose} title="Log In" subtitle="Welcome back to Poscon.">
      <form className="flex flex-col gap-4" onSubmit={handlesubmit} noValidate>
        <div>
          <label htmlFor="login-email" className="label">Email</label>
          <input
            id="login-email"
            type="email"
            className="input"
            name="email"
            placeholder="Email"
            autoComplete="email"
            onChange={handlechange}
            value={logindata.email}
          />
        </div>
        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={logindata.password}
          onChange={handlechange}
        />
        <button type="button" className="link -mt-2 self-end text-sm" onClick={openForgotPassword}>
          Forgot password?
        </button>
        {formError && <p className="field-error" role="alert">{formError}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Logging in..." : "Log In"}
        </button>
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Demo account: <span className="font-medium text-gray-900">demo@poscon.dev</span> /{" "}
          <span className="font-medium text-gray-900">demo1234</span>
        </p>
        <p className="text-center text-sm text-gray-600">
          New to Poscon?{" "}
          <button type="button" className="link" onClick={handleRegister}>
            Create an account
          </button>
        </p>
      </form>
    </AuthDialog>
  );
}

export default Login;
