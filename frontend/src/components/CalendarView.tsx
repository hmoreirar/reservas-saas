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
    <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
      <h3 className="m-0 mb-5 text-lg font-semibold text-gray-800">
        Agenda - {serviceName}
      </h3>

      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onPrevWeek}
          className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          &larr; Semana anterior
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          onClick={onNextWeek}
          className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          Semana siguiente &rarr;
        </button>
      </div>

      <div className="mb-8 grid grid-cols-7 gap-3">
        {getWeekDays(selectedDate).map((day, i) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          return (
            <div
              key={i}
              onClick={() => onDateChange(dateStr)}
              className={`min-h-[60px] cursor-pointer rounded-lg p-4 transition-colors ${
                dateStr === selectedDate
                  ? "bg-indigo-50"
                  : isToday
                    ? "bg-red-50"
                    : "bg-gray-50"
              }`}
            >
              <div
                className={`text-sm ${
                  isToday ? "font-bold text-indigo-500" : "text-gray-700"
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
          <h4 className="mb-3 text-base font-semibold text-gray-700">
            Horarios disponibles para {selectedDate}
          </h4>
          {slots}
        </>
      )}
    </div>
  );
}
