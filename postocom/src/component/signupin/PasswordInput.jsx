import { useState } from "react";

function PasswordInput({ id, name, label, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          className="input pr-16"
          placeholder={label}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
