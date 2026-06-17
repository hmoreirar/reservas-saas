import { useState, useEffect, useCallback } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  variant: "success" | "error";
}

let nextId = 1;
let addToastFn: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(text: string, variant: "success" | "error" = "success") {
  addToastFn?.({ text, variant });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = useCallback((msg: Omit<ToastMessage, "id">) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2 md:right-6 md:top-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-in rounded-lg border border-border bg-surface px-4 py-3 text-sm ${
            t.variant === "success"
              ? "border-l-accent border-l-4"
              : "border-l-danger border-l-4"
          }`}
        >
          <span className={t.variant === "success" ? "text-accent-text" : "text-danger"}>
            {t.text}
          </span>
        </div>
      ))}
    </div>
  );
}
