import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/10"
      onClick={onClose}
    >
      <div
        className="mx-4 w-[calc(100vw-32px)] max-w-md rounded-xl border border-border bg-surface p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-lg font-semibold text-text">{title}</h2>
        {children}
      </div>
    </div>
  );
}
