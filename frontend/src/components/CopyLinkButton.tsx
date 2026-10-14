import { useState } from "react";

interface CopyLinkButtonProps {
  url: string;
  label?: string;
  variant?: "primary" | "secondary";
}

// El momento clave del producto: compartir el link con los pacientes.
// Por eso el boton es grande, explicito y confirma con feedback.
export default function CopyLinkButton({
  url,
  label = "Copiar link de reservas",
  variant = "primary",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // sin clipboard API: seleccionar para copia manual
      window.prompt("Copia este link:", url);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
        variant === "primary"
          ? "bg-accent text-accent-text hover:bg-accent-hover"
          : "border border-border bg-surface text-text hover:border-accent hover:text-accent"
      }`}
    >
      {copied ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Link copiado
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
