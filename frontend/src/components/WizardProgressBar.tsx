type StepStatus = "completed" | "current" | "upcoming";

interface WizardProgressBarProps {
  steps: { label: string }[];
  currentStep: number;
}

const statusStyles: Record<StepStatus, { circle: string; line: string; label: string }> = {
  completed: {
    circle: "bg-accent text-white border-accent",
    line: "bg-accent",
    label: "text-accent",
  },
  current: {
    circle: "bg-accent text-white border-accent ring-2 ring-accent/30",
    line: "bg-border",
    label: "text-text font-semibold",
  },
  upcoming: {
    circle: "bg-surface text-text-muted border-border",
    line: "bg-border",
    label: "text-text-muted",
  },
};

export default function WizardProgressBar({ steps, currentStep }: WizardProgressBarProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((step, index) => {
        const status: StepStatus =
          index + 1 < currentStep ? "completed" : index + 1 === currentStep ? "current" : "upcoming";
        const styles = statusStyles[status];
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${styles.circle}`}
              >
                {status === "completed" ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`text-xs ${styles.label}`}>{step.label}</span>
            </div>
            {!isLast && (
              <div className={`mx-2 mb-5 h-0.5 w-12 transition-colors duration-500 sm:w-20 ${styles.line}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
