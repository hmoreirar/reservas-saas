import { useMemo } from "react";

interface WeekBarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function getWeekDays(dateStr: string): Date[] {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function WeekBar({
  selectedDate,
  onDateChange,
  onPrevWeek,
  onNextWeek,
}: WeekBarProps) {
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const todayStr = new Date().toISOString().split("T")[0]!;

  const firstDay = weekDays[0]!;
  const lastDay = weekDays[6]!;
  const firstMonth = firstDay.toLocaleDateString("es-ES", { month: "long" });
  const lastMonth = lastDay.toLocaleDateString("es-ES", { month: "long" });
  const firstYear = firstDay.getFullYear();
  const lastYear = lastDay.getFullYear();

  const monthLabel =
    firstMonth === lastMonth && firstYear === lastYear
      ? `${firstMonth} ${firstYear}`
      : `${firstMonth} - ${lastMonth} ${lastYear}`;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onPrevWeek}
          className="cursor-pointer rounded-md p-1 text-text-secondary transition-colors hover:bg-accent-bg hover:text-accent"
          aria-label="Semana anterior"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold capitalize text-text">{monthLabel}</span>
        <button
          onClick={onNextWeek}
          className="cursor-pointer rounded-md p-1 text-text-secondary transition-colors hover:bg-accent-bg hover:text-accent"
          aria-label="Semana siguiente"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split("T")[0]!;
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => onDateChange(dateStr)}
              className={`flex flex-col items-center rounded-lg py-2 text-sm transition-colors ${
                isSelected
                  ? "bg-accent text-accent-text"
                  : "text-text hover:bg-accent-bg"
              }`}
            >
              <span className="text-xs capitalize">
                {day.toLocaleDateString("es-ES", { weekday: "short" })}
              </span>
              <span
                className={`mt-0.5 tabular-nums ${
                  isToday && !isSelected ? "font-bold text-accent" : ""
                }`}
              >
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
