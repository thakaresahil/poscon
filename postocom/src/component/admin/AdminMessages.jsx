import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/client";
import Loading from "../loading/Loading";
import AdminLayout from "./AdminLayout";
import { formatDate } from "../../utils/format";

const filters = [
  ["", "All"],
  ["new", "Unread"],
  ["read", "Read"],
];

function AdminMessages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setResult(null);
    const params = { page };
    if (status) params.status = status;
    api
      .get("/admin/messages", { params })
      .then((response) => setResult(response.data))
      .catch(() => setError("Could not load messages, please try again."));
  }, [status, page]);

  const setMessageStatus = async (message, newStatus) => {
    setError("");
    try {
      await api.patch(`/admin/messages/${message.id}`, { status: newStatus });
      setResult((current) => ({
        ...current,
        unread: current.unread + (newStatus === "new" ? 1 : -1),
        messages: current.messages.map((item) => (item.id === message.id ? { ...item, status: newStatus } : item)),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Could not update the message.");
    }
  };

  const toggle = (message) => {
    const opening = open !== message.id;
    setOpen(opening ? message.id : null);
    if (opening && message.status === "new") {
      setMessageStatus(message, "read");
    }
  };

  const goToPage = (number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", number);
    setSearchParams(next);
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center gap-2" aria-label="Filter messages">
        {filters.map(([value, label]) => (
          <button
            key={label}
            className={`rounded-full border px-4 py-1 ${status === value ? "border-red-500 font-semibold text-red-500" : "border-gray-300"}`}
            onClick={() => setSearchParams(value ? { status: value } : {})}
          >
            {label}
          </button>
        ))}
        {result && <span className="ml-auto text-sm text-gray-500">{result.unread} unread</span>}
      </div>

      {error && <p className="field-error">{error}</p>}
      {!result ? (
        <Loading />
      ) : result.messages.length === 0 ? (
        <p className="muted">No messages yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
          {result.messages.map((message) => (
            <li key={message.id}>
              <button
                className="flex w-full items-start gap-3 p-4 text-left hover:bg-gray-50"
                aria-expanded={open === message.id}
                onClick={() => toggle(message)}
              >
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${message.status === "new" ? "bg-red-500" : "bg-transparent"}`}
                  aria-label={message.status === "new" ? "Unread" : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap justify-between gap-2">
                    <span className={message.status === "new" ? "font-semibold" : ""}>
                      {message.name} <span className="font-normal text-gray-500">&lt;{message.email}&gt;</span>
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(message.created_at)}</span>
                  </span>
                  <span className="block truncate text-gray-700">{message.subject || message.message}</span>
                </span>
              </button>
              {open === message.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-9 py-4">
                  {message.subject && <p className="font-semibold">{message.subject}</p>}
                  <p className="mt-2 whitespace-pre-wrap">{message.message}</p>
                  <div className="mt-4 flex gap-3">
                    <a className="btn btn-primary btn-sm" href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your message to Poscon"}`)}`}>
                      Reply by email
                    </a>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMessageStatus(message, message.status === "new" ? "read" : "new")}>
                      Mark as {message.status === "new" ? "read" : "unread"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {result && result.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Previous</button>
          <span className="text-gray-500">Page {page} of {result.totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= result.totalPages} onClick={() => goToPage(page + 1)}>Next</button>
        </nav>
      )}
    </AdminLayout>
  );
}

export default AdminMessages;
