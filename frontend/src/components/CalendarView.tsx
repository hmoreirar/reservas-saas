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
  return (
    <div className="rounded-xl border border-stone-100 bg-white p-4 shadow-sm md:p-8">
      <h3 className="m-0 mb-5 text-lg font-semibold text-stone-800">
        Agenda - {serviceName}
      </h3>

      <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
        <button
          onClick={onPrevWeek}
          className="cursor-pointer rounded-md bg-stone-100 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-200"
        >
          &larr; Semana anterior
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <button
          onClick={onNextWeek}
          className="cursor-pointer rounded-md bg-stone-100 px-4 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-200"
        >
          Semana siguiente &rarr;
        </button>
      </div>

      <div className="mb-8 grid grid-cols-7 gap-1 md:gap-3">
        {getWeekDays(selectedDate).map((day, i) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          return (
            <div
              key={i}
              onClick={() => onDateChange(dateStr)}
              className={`min-h-[40px] cursor-pointer rounded-lg p-2 transition-colors md:min-h-[60px] md:p-4 ${
                dateStr === selectedDate
                  ? "bg-amber-50"
                  : isToday
                    ? "bg-red-50"
                    : "bg-stone-50"
              }`}
            >
              <div
                className={`text-[11px] md:text-sm ${
                  isToday ? "font-bold text-amber-500" : "text-stone-700"
                }`}
              >
                {day.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          );
        })}
      </div>

      {slots && (
        <>
          <h4 className="mb-3 text-base font-semibold text-stone-700">
            Horarios disponibles para {selectedDate}
          </h4>
          {slots}
        </>
      )}
    </div>
  );
}
