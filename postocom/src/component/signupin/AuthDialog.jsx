import { Dialog } from "@mui/material";

// Shared frame for the login, signup and forgot password dialogs
function AuthDialog({ open, title, subtitle, onClose, children }) {
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="auth-dialog-title" fullWidth maxWidth="xs">
      <div className="relative px-6 py-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 id="auth-dialog-title" className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="muted mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </Dialog>
  );
}

export default AuthDialog;
