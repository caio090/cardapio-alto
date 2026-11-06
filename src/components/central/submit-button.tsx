"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Salvando…",
  className,
  name,
  value,
  confirmText,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  name?: string;
  value?: string;
  confirmText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirmText && !window.confirm(confirmText)) e.preventDefault();
      }}
      className={
        className ??
        "inline-flex items-center justify-center rounded-md bg-teal-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-50"
      }
    >
      {pending ? pendingText : children}
    </button>
  );
}
