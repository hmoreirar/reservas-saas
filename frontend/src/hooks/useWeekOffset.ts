import { useState } from "react";

export function useWeekOffset(initial = 0) {
  const [weekOffset, setWeekOffset] = useState(initial);

  const prevWeek = () => setWeekOffset((w) => w - 1);
  const nextWeek = () => setWeekOffset((w) => w + 1);

  return { weekOffset, prevWeek, nextWeek };
}
