import { useEffect, useState } from "react";

const WORLD_CLOCKS = [
  { label: "Jakarta", sub: "WIB", tz: "Asia/Jakarta" },
  { label: "Makassar", sub: "WITA", tz: "Asia/Makassar" },
  { label: "Jayapura", sub: "WIT", tz: "Asia/Jayapura" },
  { label: "London", sub: "GMT", tz: "Europe/London" },
  { label: "Tokyo", sub: "JST", tz: "Asia/Tokyo" },
  { label: "New York", sub: "EST", tz: "America/New_York" },
];

export function useWorldClockNow() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return now;
}

function formatTimeForZone(now, tz) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return "--:--:--";
  }
}

function formatDateForZone(now, tz) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: tz,
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(now);
  } catch {
    return "";
  }
}

export default function WorldClock() {
  const now = useWorldClockNow();

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {WORLD_CLOCKS.map((clock) => (
        <li
          key={clock.tz}
          className="flex items-center justify-between px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {clock.label}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {clock.sub} &middot; {formatDateForZone(now, clock.tz)}
            </p>
          </div>
          <p className="text-base font-mono font-bold text-primary dark:text-emerald-400 tabular-nums">
            {formatTimeForZone(now, clock.tz)}
          </p>
        </li>
      ))}
    </ul>
  );
}
