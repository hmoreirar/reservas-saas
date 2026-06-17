import { getWeekDays } from "../hooks/useWeekDays";

interface CalendarViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  serviceName: string;
  slots?: React.ReactNode;
}

export default function CalendarView({
  selectedDate,
  onDateChange,
  onPrevWeek,
  onNextWeek,
  serviceName,
  slots,
}: CalendarViewProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
      <h3 className="m-0 mb-6 text-lg font-semibold text-text">Agenda &middot; {serviceName}</h3>

      <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
        <button
          onClick={onPrevWeek}
          className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text"
        >
          &larr; Semana anterior
        </button>
        <button
          onClick={onNextWeek}
          className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-hover hover:text-text"
        >
          Semana siguiente &rarr;
        </button>
      </div>

      <div className="mb-6 grid grid-cols-7 gap-1 md:gap-2">
        {getWeekDays(selectedDate).map((day, i) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={i}
              onClick={() => onDateChange(dateStr)}
              className={`min-h-[44px] cursor-pointer rounded-lg border p-2 transition-colors md:min-h-[64px] md:p-3 ${
                isSelected
                  ? "border-accent bg-accent-bg"
                  : isToday
                    ? "border-border-hover bg-bg"
                    : "border-transparent"
              }`}
            >
              <div className={`text-xs md:text-sm ${isSelected ? "font-medium text-accent-text" : "text-text-secondary"}`}>
                {day.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" })}
              </div>
            </div>
          );
        })}
      </div>

      {slots && (
        <>
          <h4 className="mb-3 text-base font-semibold text-text">Horarios disponibles</h4>
          {slots}
        </>
      )}
    </div>
  );
}
