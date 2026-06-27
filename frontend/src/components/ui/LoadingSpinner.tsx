type Size = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  size?: Size;
}

const sizeStyles: Record<Size, string> = {
  sm: "h-5 w-5 border-2",
  md: "h-10 w-10 border-4",
  lg: "h-14 w-14 border-4",
};

export default function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className={`animate-spin rounded-full border-border border-t-accent ${sizeStyles[size]}`} />
    </div>
  );
}
