import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const ToastContext = createContext(null);

// Shows one short message at a time in the corner of the screen
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, action) => {
    clearTimeout(timer.current);
    setToast({ message, action, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:justify-end">
        {toast && (
          <div key={toast.key} role="status" className="pointer-events-auto flex items-center gap-4 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
            <span>{toast.message}</span>
            {toast.action && (
              <Link to={toast.action.to} className="font-semibold text-red-300 hover:text-red-200" onClick={() => setToast(null)}>
                {toast.action.label}
              </Link>
            )}
            <button className="text-gray-400 hover:text-white" aria-label="Dismiss" onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
