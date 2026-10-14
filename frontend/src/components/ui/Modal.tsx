import { useEffect, useRef, useId, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** anclado abajo en mobile (bottom sheet), centrado en desktop */
  sheet?: boolean;
}

export default function Modal({ open, onClose, title, children, sheet = false }: ModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // Ref para no re-suscribir el listener con cada render: onClose suele ser inline.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

       const first = focusable[0]!;
       const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handler);

    requestAnimationFrame(() => {
      const first = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    });

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    };
    // Solo al abrir/cerrar: con onClose en deps (suele ser inline) el efecto se
    // re-ejecutaba con cada render y robaba el foco mientras se escribia.
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex animate-fade-in justify-center bg-black/20 ${sheet ? "items-end sm:items-center" : "items-center"}`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`mx-4 w-[calc(100vw-32px)] max-w-md border border-border bg-surface p-8 ${sheet ? "mb-0 rounded-t-2xl sm:mb-0 sm:rounded-xl" : "rounded-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="mb-6 text-lg font-semibold text-text">{title}</h2>
        {children}
      </div>
    </div>
  );
}
