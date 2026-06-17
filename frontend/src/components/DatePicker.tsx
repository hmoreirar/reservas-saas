import { useMemo } from "react";
import { getWeekDays } from "../hooks/useWeekDays";

interface DatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  weekOffset: number;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function DatePicker({ selectedDate, onSelect, weekOffset, onPrevWeek, onNextWeek }: DatePickerProps) {
  const weekDays = useMemo(() => getWeekDays(selectedDate, weekOffset), [selectedDate, weekOffset]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const firstDay = weekDays[0];
  const lastDay = weekDays[6];
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

      <div className="flex flex-col gap-0.5">
        {weekDays.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isSelected
                  ? "bg-accent text-accent-text"
                  : "text-text hover:bg-accent-bg"
              }`}
            >
              <span className="font-medium capitalize">
                {day.toLocaleDateString("es-ES", { weekday: "short" })}
              </span>
              <span
                className={`tabular-nums ${
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
