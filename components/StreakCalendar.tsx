"use client";

interface StreakCalendarProps {
  studyHistory: string[];
  weeks?: number;
}

const LEVEL_COLORS = [
  "bg-border/40",
  "bg-success/30",
  "bg-success/50",
  "bg-success/80",
];

export function StreakCalendar({ studyHistory, weeks = 12 }: StreakCalendarProps) {
  const counts = new Map<string, number>();
  for (const date of studyHistory) {
    counts.set(date, (counts.get(date) ?? 0) + 1);
  }

  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - weeks * 7 + 1);

  const days: { date: string; level: number; dayOfWeek: number }[] = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split("T")[0];
    const count = counts.get(date) ?? 0;
    const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
    days.push({ date, level, dayOfWeek: d.getDay() });
  }

  const weekColumns: typeof days[] = [];
  let currentWeek: typeof days = [];
  for (const day of days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weekColumns.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weekColumns.push(currentWeek);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weekColumns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week.find((d) => d.dayOfWeek === di);
              if (!day) {
                return <div key={di} className="h-3 w-3" />;
              }
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.level > 0 ? "studied" : "no activity"}`}
                  className={`h-3 w-3 rounded-sm ${LEVEL_COLORS[day.level]} transition-colors`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
        <span>Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
