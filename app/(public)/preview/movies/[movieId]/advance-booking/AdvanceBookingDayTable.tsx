"use client";

import { useMemo, useState } from "react";

type BookingRecord = {
  id: number;
  booking_day: number;
  booking_date: string | null;
  coverage_type: "STATE" | "REST_OF_INDIA";
  territory_name: string;
  gross: number | null;
  admissions: number | null;
  show_count: number | null;
  atp: number | null;
  occupancy: number | null;
  notes: string | null;
  updated_at: string;
};

type CategoryRecord = {
  id: number;
  name: string;
  gross: number | null;
  admissions: number | null;
  atp: number | null;
  show_count: number | null;
  occupancy: number | null;
  notes: string | null;
  updated_at: string;
};

type DayData = {
  day: number;
  date: string | null;
  records: BookingRecord[];
  languageRecords: CategoryRecord[];
  formatRecords: CategoryRecord[];
  gross: number;
  admissions: number;
  shows: number;
  latestUpdatedAt: string | null;
};

type Props = {
  days: DayData[];
};

function formatCollection(value: number | null) {
  if (value === null || value === undefined) return "—";
  if (value === 0) return "₹0";

  return (
    "₹" +
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)
  );
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN").format(value);
}

function formatMetric(value: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
}

// Database occupancy is stored as a decimal.
// Example: 0.35 becomes 35%.
function formatOccupancy(value: number | null) {
  if (value === null || value === undefined) return "—";

  return (
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value * 100) + "%"
  );
}

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatShortDate(value: string | null) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMonthKey(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  return `${parsed.getFullYear()}-${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function getDaysInMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).getDay();
}

/* =========================================================
   CATEGORY BREAKDOWN TABLE
========================================================= */

function CategoryBreakdown({
  title,
  subtitle,
  records,
}: {
  title: string;
  subtitle: string;
  records: CategoryRecord[];
}) {
  const totalGross = records.reduce(
    (sum, record) => sum + Number(record.gross || 0),
    0
  );

  const totalAdmissions = records.reduce(
    (sum, record) => sum + Number(record.admissions || 0),
    0
  );

  const totalShows = records.reduce(
    (sum, record) => sum + Number(record.show_count || 0),
    0
  );

  return (
    <section className="mt-5 overflow-hidden rounded-xl border border-green-700 bg-zinc-950">
      <div className="border-b border-zinc-900 px-3 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
              {title}
            </p>

            <h3 className="mt-1 text-sm font-medium text-zinc-100">
              {title} Collection
            </h3>

            <p className="mt-1 text-[9px] text-zinc-500">
              {subtitle}
            </p>
          </div>

          <span className="rounded-full border border-zinc-800 px-3 py-1 text-[8px] text-zinc-400">
            {records.length} Records
          </span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-[10px] text-zinc-400">
            No {title.toLowerCase()} data available for this day.
          </p>

          <p className="mt-2 text-[8px] text-zinc-600">
            JMI has not yet recorded this category.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full">
            <table className="w-full table-fixed border-collapse bg-[#F5F5EF]">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[19%]" />
                <col className="w-[15%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[18%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-[#D5D5CA] bg-[#E8E8DE]">
                  {[
                    title === "Language-wise" ? "Language" : "Format",
                    "Gross",
                    "Tickets",
                    "ATP",
                    "Shows",
                    "Occupancy",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-1 py-3 text-[6px] font-bold uppercase tracking-[0.04em] text-[#454545] sm:px-2 sm:text-[8px] ${
  index === 0 ? "text-left" : "text-right"
}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[#E2E2D9] last:border-b-0 hover:bg-[#ECECE4]"
                  >
                    <td className="break-words px-1 py-3 text-[8px] font-bold text-zinc-800 sm:px-2 sm:text-[10px]">
                      {record.name}
                    </td>

                    <td className="break-all px-1 py-3 text-right text-[7px] font-semibold font-bold text-green-600 sm:px-2 sm:text-[9px]">
                      {formatCollection(record.gross)}
                    </td>

                    <td className="break-all px-1 py-3 text-right text-[7px] font-bold text-zinc-800 sm:px-2 sm:text-[9px]">
                      {formatNumber(record.admissions)}
                    </td>

                    <td className="break-all px-1 py-3 text-right text-[7px] font-bold text-zinc-800 sm:px-2 sm:text-[9px]">
                      {formatMetric(record.atp)}
                    </td>

                    <td className="break-all px-1 py-3 text-right text-[7px] font-bold text-zinc-800 sm:px-2 sm:text-[9px]">
                      {formatNumber(record.show_count)}
                    </td>

                    <td className="break-all px-1 py-3 text-right text-[7px] font-bold text-red-500 sm:px-2 sm:text-[9px]">
                      {formatOccupancy(record.occupancy)}
                    </td>
                  </tr>
                ))}
              </tbody>

             
            </table>
          </div>

          <div className="border-t border-zinc-900 bg-black/30 px-3 py-3 sm:px-5">
           
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================
   MAIN DAY TABLE
========================================================= */

export default function AdvanceBookingDayTable({
  days,
}: Props) {
  const availableDates = useMemo(() => {
    return days
      .filter((day) => Boolean(day.date))
      .sort((a, b) => {
        return (
          new Date(`${a.date}T00:00:00`).getTime() -
          new Date(`${b.date}T00:00:00`).getTime()
        );
      });
  }, [days]);

  const firstAvailable = availableDates[0] || null;

  const [selectedDay, setSelectedDay] = useState<number>(
    firstAvailable?.day ?? days[0]?.day ?? 0
  );

  const selectedData =
    days.find((day) => day.day === selectedDay) ||
    days[0] ||
    null;

  const initialMonth = selectedData?.date
    ? getMonthKey(selectedData.date)
    : availableDates[0]?.date
      ? getMonthKey(availableDates[0].date)
      : "";

  const [calendarMonth, setCalendarMonth] = useState(initialMonth);

  const availableByDate = useMemo(() => {
    const map = new Map<string, DayData>();

    for (const day of days) {
      if (day.date) {
        map.set(day.date, day);
      }
    }

    return map;
  }, [days]);

  function selectDay(day: DayData) {
    setSelectedDay(day.day);

    if (day.date) {
      setCalendarMonth(getMonthKey(day.date));
    }
  }

  function moveMonth(direction: number) {
    if (!calendarMonth) return;

    const [year, month] = calendarMonth.split("-").map(Number);

    const next = new Date(year, month - 1 + direction, 1);

    setCalendarMonth(
      `${next.getFullYear()}-${String(
        next.getMonth() + 1
      ).padStart(2, "0")}`
    );
  }

  const calendarDays = calendarMonth
    ? Array.from(
        { length: getDaysInMonth(calendarMonth) },
        (_, index) => index + 1
      )
    : [];

  const firstWeekday = calendarMonth
    ? getFirstWeekday(calendarMonth)
    : 0;

  return (
    <div className="mt-7">
      {/* SECTION HEADER */}

      <div className="mb-4">
        <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
          Day-wise Intelligence
        </p>

        <h2 className="mt-1 text-sm font-medium text-yellow-500">
          Advance Booking Timeline
        </h2>

        <p className="mt-1 text-[9px] leading-5 text-zinc-500">
          Select a tracked date to view the territory, language and
          exhibition-format advance booking performance for that day.
        </p>
      </div>

      {/* CALENDAR SELECTOR */}

      <div className="rounded-xl border border-violet-700/50 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
              Tracking Calendar
            </p>

            <p className="mt-1 text-[9px] text-zinc-400">
              Highlighted dates have JMI Live Tracking data.
            </p>
          </div>

          {selectedData && (
            <div className="text-right">
              <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-400">
                Selected
              </p>

              <p className="mt-1 text-[9px] font-medium text-yellow-400">
                Day {selectedData.day}
              </p>
            </div>
          )}
        </div>

        {calendarMonth && (
          <div className="mt-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-200"
                aria-label="Previous month"
              >
                ←
              </button>

              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-300">
                {getMonthLabel(calendarMonth)}
              </p>

              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-200"
                aria-label="Next month"
              >
                →
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="py-1 text-center text-[7px] uppercase tracking-[0.08em] text-green-400"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }).map((_, index) => (
                <div key={`empty-${index}`} className="h-9" />
              ))}

              {calendarDays.map((dayNumber) => {
                const date = `${calendarMonth}-${String(
                  dayNumber
                ).padStart(2, "0")}`;

                const available = availableByDate.get(date);
                const selected = available?.day === selectedDay;

                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!available}
                    onClick={() => available && selectDay(available)}
                    className={`relative flex h-9 items-center justify-center rounded-lg text-[9px] transition ${
                      selected
                        ? "border border-yellow-500/50 bg-yellow-500/10 font-semibold text-yellow-400"
                        : available
                          ? "border border-violet-900/50 bg-violet-950/20 font-medium text-violet-300 hover:border-violet-700 hover:bg-violet-950/40"
                          : "border border-transparent text-zinc-400"
                    }`}
                  >
                    {dayNumber}

                    {available && (
                      <span
                        className={`absolute bottom-1 h-1 w-1 rounded-full ${
                          selected ? "bg-yellow-400" : "bg-violet-500"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUICK DAY SELECTOR */}

        <div className="mt-5 border-t border-zinc-900 pt-4">
          <p className="mb-2 text-[7px] uppercase tracking-[0.12em] text-zinc-400">
            Available Tracking Days
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => {
              const selected = day.day === selectedDay;

              return (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-[8px] font-medium transition ${
                    selected
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                      : "border-zinc-900 bg-black text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                  }`}
                >
                  <span className="block">Day {day.day}</span>

                  {day.date && (
                    <span className="mt-0.5 block text-[7px] text-zinc-400">
                      {formatShortDate(day.date)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SELECTED DAY */}

      {selectedData && (
        <section className="mt-5 overflow-hidden rounded-2xl border border-pink-700 bg-zinc-950 px-0 py-4 sm:px-5">
          <div className="border-b border-zinc-900 bg-zinc-950 px-2 py-4 sm:px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-medium text-zinc-100">
                    Day {selectedData.day}
                  </h3>

                  {selectedData.day === 0 && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-yellow-400">
                      Premiere Day
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] font-medium text-yellow-400">
                  {formatDate(selectedData.date)}
                </p>

                <p className="mt-1 text-[8px] text-zinc-600">
                  {selectedData.records.length} state / territory records
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-zinc-900 bg-black px-2 py-2 sm:px-3">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-green-400">
                    Gross
                  </p>

                  <p className="mt-1 text-xs font-semibold text-yellow-400">
                    {formatCollection(selectedData.gross)}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-2 py-2 sm:px-3">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-green-400">
                    Admissions
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-300">
                    {formatNumber(selectedData.admissions)}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-2 py-2 sm:px-3">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-green-400">
                    Shows
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-300">
                    {formatNumber(selectedData.shows)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STATE-WISE TABLE */}

          <div className="border-b border-zinc-900 px-2 py-4 sm:px-5">
            <div className="mb-3 px-1">
              <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                Territory Breakdown
              </p>

              <h3 className="mt-1 text-sm font-medium text-zinc-100">
                State-wise Collection
              </h3>
            </div>

            <div className="w-full">
              <table className="w-full table-fixed border-collapse bg-[#F5F5EF]">
                <colgroup>
                  <col className="hidden sm:table-column sm:w-[13%]" />
                  <col className="w-[25%] sm:w-[21%]" />
                  <col className="w-[20%] sm:w-[19%]" />
                  <col className="w-[16%] sm:w-[15%]" />
                  <col className="w-[11%] sm:w-[11%]" />
                  <col className="w-[12%] sm:w-[10%]" />
                  <col className="w-[16%] sm:w-[11%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-[#D5D5CA] bg-[#E8E8DE]">
                    

                    {[
                      "Territory",
                      "Gross",
                      "Admissions",
                      "ATP",
                      "Shows",
                      "Occupancy",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`px-2 py-4 text-[7px] font-large font-bold uppercase tracking-[0.02em] text-zinc-800 sm:px-2 sm:text-[8px] ${
                          index === 0 ? "text-left" : "text-right"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {selectedData.records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#E2E2D9] last:border-b-0 hover:bg-[#ECECE4]"
                    >
                      

                      <td className="break-words px-0 py-3 sm:px-2 sm:py-4">
                        <div className="flex items-start gap-1 sm:gap-2">
                          
                          <div className="min-w-0">
                            <p className="break-words text-[9px]  font-large font-bold leading-4 text-zinc-800 sm:text-[10px]">
                              {record.territory_name}
                            </p>

                            
                          </div>
                        </div>
                      </td>

                      <td className="break-all px-1 py-3 text-right text-[8px] font-bold text-green-600 sm:px-2 sm:py-4 sm:text-[9px]">
                        {formatCollection(record.gross)}
                      </td>

                      {/* CORRECTED: ADMISSIONS */}

                      <td className="break-all px-1 py-3 text-right font-bold text-[8px] text-zinc-800 sm:px-2 sm:py-4 sm:text-[9px]">
                        {formatNumber(record.admissions)}
                      </td>

                      {/* CORRECTED: ATP */}

                      <td className="break-all px-1 py-3 text-right font-bold text-[8px] text-zinc-800 sm:px-2 sm:py-4 sm:text-[9px]">
                        {formatMetric(record.atp)}
                      </td>

                      <td className="break-all px-1 py-3 text-right font-bold text-[8px] text-zinc-800 sm:px-2 sm:py-4 sm:text-[9px]">
                        {formatNumber(record.show_count)}
                      </td>

                      <td className="break-all px-1 py-3 text-right font-bold text-[8px] text-red-500 sm:px-2 sm:py-4 sm:text-[9px]">
                        {formatOccupancy(record.occupancy)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                
              </table>
            </div>
          </div>

          {/* STATE NOTES */}

          {selectedData.records.some((record) => record.notes) && (
            <div className="border-t border-zinc-900 bg-black/30 px-4 py-4 sm:px-5">
              <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                State Tracking Notes
              </p>

              <div className="mt-2 space-y-2">
                {selectedData.records
                  .filter((record) => record.notes)
                  .map((record) => (
                    <div
                      key={`state-note-${record.id}`}
                      className="border-l border-zinc-800 pl-3"
                    >
                      <p className="text-[8px] font-medium text-zinc-500">
                        {record.territory_name}
                      </p>

                      <p className="mt-1 text-[9px] leading-5 text-zinc-600">
                        {record.notes}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-900 bg-black/40 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[8px] text-zinc-500">
                Latest State-wise update for Day {selectedData.day}
              </p>

              <p className="text-[8px] text-zinc-500">
                {formatUpdatedAt(selectedData.latestUpdatedAt)}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* LANGUAGE-WISE BREAKDOWN */}

      {selectedData && (
        <CategoryBreakdown
          title="Language-wise"
          subtitle="Live Tracking performance by language."
          records={selectedData.languageRecords}
        />
      )}

      {/* FORMAT-WISE BREAKDOWN */}

      {selectedData && (
        <CategoryBreakdown
          title="Format-wise"
          subtitle="Live Tracking performance by exhibition format."
          records={selectedData.formatRecords}
        />
      )}

      {/* CATEGORY DATA EXPLANATION */}

      {selectedData && (
        <div className="mt-4 rounded-lg border border-pink-900 bg-zinc-950 px-4 py-3">
          <p className="text-[8px] uppercase tracking-[0.14em] text-violet-400">
            Understanding the Breakdowns
          </p>

          <p className="mt-2 text-[9px] leading-5 text-zinc-500">
            State-wise, Language-wise and Format-wise figures represent
            different classifications of advance booking activity.
            Their gross collections should not be added together.
            JMI displays each classification separately to avoid
            double-counting.
          </p>
        </div>
      )}
    </div>
  );
}