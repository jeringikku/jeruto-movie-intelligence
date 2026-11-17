
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

type CumulativeRecord = {
  id: string;
  name: string;
  gross: number;
  admissions: number;
  shows: number;
  atp: number | null;
  occupancy: number | null;
};

/* =========================================================
   FORMATTERS
========================================================= */

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
   SORTING
========================================================= */

function sortByGross<T extends { gross: number | null }>(
  records: T[]
) {
  return [...records].sort(
    (a, b) => Number(b.gross || 0) - Number(a.gross || 0)
  );
}

/* =========================================================
   TABLE STYLING
========================================================= */

const tableHeaderClass =
  "border-r border-[#C5C5B9] px-3 py-4 text-center text-[10px] font-extrabold uppercase tracking-[0.03em] text-[#363636] last:border-r-0 sm:px-4 sm:py-4 sm:text-xs";

const tableNameCellClass =
  "border-r border-[#D0D0C5] px-3 py-4 text-center text-[11px] font-bold text-zinc-800 last:border-r-0 sm:px-4 sm:py-4 sm:text-xs";

const tableGrossCellClass =
  "border-r border-[#D0D0C5] px-3 py-4 text-center text-[11px] font-extrabold text-green-700 last:border-r-0 sm:px-4 sm:py-4 sm:text-xs";

const tableNumberCellClass =
  "border-r border-[#D0D0C5] px-3 py-4 text-center text-[11px] font-semibold text-zinc-800 last:border-r-0 sm:px-4 sm:py-4 sm:text-xs";

const tableOccupancyCellClass =
  "px-3 py-4 text-center text-[11px] font-bold text-red-600 sm:px-4 sm:py-4 sm:text-xs";

const tableRowClass =
  "border-b border-[#D0D0C5] last:border-b-0 transition-colors hover:bg-[#ECECE4]";

/* =========================================================
   JMI WATERMARK
========================================================= */

function TableWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="select-none -rotate-[24deg] text-center opacity-[0.075]">
        <p className="whitespace-nowrap font-serif text-5xl font-black tracking-[0.2em] text-[#292929] sm:text-7xl">
          JMI
        </p>
        <p className="mt-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.35em] text-[#292929] sm:text-xs">
          Jeruto Movie Intelligence
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LEADER TROPHY
========================================================= */

function LeaderTrophy() {
  return (
    <span
      title="Highest grossing entry"
      aria-label="Highest grossing entry"
      className="ml-1 inline-block animate-pulse text-sm"
    >
      🏆
    </span>
  );
}

/* =========================================================
   SHARED TABLE WRAPPER
========================================================= */

function TableWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate w-full overflow-hidden rounded-lg border border-[#C5C5B9] bg-[#F5F5EF]">
      <TableWatermark />
      <div className="relative z-10 w-full overflow-x-auto">
        {children}
      </div>
    </div>
  );
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
  const sortedRecords = useMemo(
    () => sortByGross(records),
    [records]
  );

  return (
    <section className="mt-7 w-full">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            {title}
          </p>

          <h3 className="mt-1 text-base font-semibold text-zinc-100">
            {title} Collection
          </h3>

          <p className="mt-1 text-[10px] text-zinc-500">
            {subtitle}
          </p>
        </div>

        <span className="text-[9px] text-zinc-500">
          {records.length} Records
        </span>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="border-y border-zinc-800 px-4 py-8 text-center">
          <p className="text-[11px] text-zinc-400">
            No {title.toLowerCase()} data available for this day.
          </p>

          <p className="mt-2 text-[9px] text-zinc-600">
            JMI has not yet recorded this category.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <table className="w-full min-w-[760px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[19%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[18%]" />
            </colgroup>

            <thead>
              <tr className="border-b-2 border-[#BEBEB2] bg-[#E8E8DE]">
                {[
                  title === "Language-wise" ? "Language" : "Format",
                  "Gross",
                  "Tickets",
                  "ATP",
                  "Shows",
                  "Occupancy",
                ].map((heading) => (
                  <th key={heading} className={tableHeaderClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedRecords.map((record, index) => (
                <tr key={record.id} className={tableRowClass}>
                  <td className={tableNameCellClass}>
                    <span className="inline-flex items-center justify-center">
                      {record.name}
                      {index === 0 && <LeaderTrophy />}
                    </span>
                  </td>

                  <td className={tableGrossCellClass}>
                    {formatCollection(record.gross)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatNumber(record.admissions)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatMetric(record.atp)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatNumber(record.show_count)}
                  </td>

                  <td className={tableOccupancyCellClass}>
                    {formatOccupancy(record.occupancy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </section>
  );
}

/* =========================================================
   CUMULATIVE AGGREGATION
========================================================= */

function buildCumulativeRecords(days: DayData[]) {
  const stateMap = new Map<string, CumulativeRecord>();
  const languageMap = new Map<string, CumulativeRecord>();
  const formatMap = new Map<string, CumulativeRecord>();

  const occupancyWeights = new Map<
    string,
    { weightedTotal: number; totalShows: number }
  >();

  function addRecord(
    map: Map<string, CumulativeRecord>,
    key: string,
    name: string,
    gross: number | null,
    admissions: number | null,
    shows: number | null,
    occupancy: number | null
  ) {
    const existing = map.get(key) || {
      id: key,
      name,
      gross: 0,
      admissions: 0,
      shows: 0,
      atp: null,
      occupancy: null,
    };

    existing.gross += Number(gross || 0);
    existing.admissions += Number(admissions || 0);
    existing.shows += Number(shows || 0);

    map.set(key, existing);

    if (occupancy !== null && occupancy !== undefined && shows && shows > 0) {
      const weight = occupancyWeights.get(key) || {
        weightedTotal: 0,
        totalShows: 0,
      };

      weight.weightedTotal += occupancy * shows;
      weight.totalShows += shows;

      occupancyWeights.set(key, weight);
    }
  }

  for (const day of days) {
    for (const record of day.records) {
      const key = record.territory_name.trim().toLowerCase();

      addRecord(
        stateMap,
        key,
        record.territory_name,
        record.gross,
        record.admissions,
        record.show_count,
        record.occupancy
      );
    }

    for (const record of day.languageRecords) {
      const key = record.name.trim().toLowerCase();

      addRecord(
        languageMap,
        key,
        record.name,
        record.gross,
        record.admissions,
        record.show_count,
        record.occupancy
      );
    }

    for (const record of day.formatRecords) {
      const key = record.name.trim().toLowerCase();

      addRecord(
        formatMap,
        key,
        record.name,
        record.gross,
        record.admissions,
        record.show_count,
        record.occupancy
      );
    }
  }

  function finalize(map: Map<string, CumulativeRecord>) {
    return Array.from(map.values())
      .map((record) => {
        const weight = occupancyWeights.get(record.id);

        return {
          ...record,
          atp:
            record.admissions > 0
              ? record.gross / record.admissions
              : null,
          occupancy:
            weight && weight.totalShows > 0
              ? weight.weightedTotal / weight.totalShows
              : null,
        };
      })
      .sort((a, b) => b.gross - a.gross);
  }

  return {
    states: finalize(stateMap),
    languages: finalize(languageMap),
    formats: finalize(formatMap),
  };
}

/* =========================================================
   CUMULATIVE TABLE
========================================================= */

function CumulativeTable({
  title,
  subtitle,
  firstColumn,
  records,
}: {
  title: string;
  subtitle: string;
  firstColumn: string;
  records: CumulativeRecord[];
}) {
  return (
    <section className="mt-7 w-full">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
            {title}
          </p>

          <h3 className="mt-1 text-base font-semibold text-zinc-100">
            Cumulative {firstColumn} Collection
          </h3>

          <p className="mt-1 text-[10px] text-zinc-500">
            {subtitle}
          </p>
        </div>

        <span className="text-[9px] text-zinc-500">
          {records.length} Records
        </span>
      </div>

      {records.length === 0 ? (
        <div className="border-y border-zinc-800 px-4 py-8 text-center">
          <p className="text-[11px] text-zinc-400">
            No cumulative data available.
          </p>
        </div>
      ) : (
        <TableWrapper>
          <table className="w-full min-w-[760px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[19%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[18%]" />
            </colgroup>

            <thead>
              <tr className="border-b-2 border-[#BEBEB2] bg-[#E8E8DE]">
                {[
                  firstColumn,
                  "Gross",
                  "Tickets",
                  "ATP",
                  "Shows",
                  "Occupancy",
                ].map((heading) => (
                  <th key={heading} className={tableHeaderClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className={tableRowClass}>
                  <td className={tableNameCellClass}>
                    <span className="inline-flex items-center justify-center">
                      {record.name}
                      {index === 0 && <LeaderTrophy />}
                    </span>
                  </td>

                  <td className={tableGrossCellClass}>
                    {formatCollection(record.gross)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatNumber(record.admissions)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatMetric(record.atp)}
                  </td>

                  <td className={tableNumberCellClass}>
                    {formatNumber(record.shows)}
                  </td>

                  <td className={tableOccupancyCellClass}>
                    {formatOccupancy(record.occupancy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
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

  const sortedStateRecords = useMemo(
    () => sortByGross(selectedData?.records || []),
    [selectedData]
  );

  const cumulativeData = useMemo(
    () => buildCumulativeRecords(days),
    [days]
  );

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
    <div className="mt-7 w-full">
      {/* SECTION HEADER */}

      <div className="mb-4">
        <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
          Day-wise Intelligence
        </p>

        <h2 className="mt-1 text-base font-semibold text-yellow-500">
          Advance Booking Timeline
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-zinc-500">
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
        <section className="mt-6 w-full">
          <div className="border-b border-zinc-800 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-zinc-100">
                    Day {selectedData.day}
                  </h3>

                  {selectedData.day === 0 && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-yellow-400">
                      Premiere Day
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[11px] font-medium text-yellow-400">
                  {formatDate(selectedData.date)}
                </p>

                <p className="mt-1 text-[9px] text-zinc-500">
                  {selectedData.records.length} state / territory records
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-green-400">
                    Gross
                  </p>

                  <p className="mt-1 text-xs font-semibold text-yellow-400">
                    {formatCollection(selectedData.gross)}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-green-400">
                    Admissions
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-300">
                    {formatNumber(selectedData.admissions)}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">
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

          <div className="mt-5 w-full">
            <div className="mb-3">
              <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
                Territory Breakdown
              </p>

              <h3 className="mt-1 text-base font-semibold text-zinc-100">
                State-wise Collection
              </h3>
            </div>

            {sortedStateRecords.length === 0 ? (
              <div className="border-y border-zinc-800 px-4 py-8 text-center text-[11px] text-zinc-500">
                No state-wise data available for this day.
              </div>
            ) : (
              <TableWrapper>
                <table className="w-full min-w-[760px] table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[19%]" />
                    <col className="w-[18%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[17%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b-2 border-[#BEBEB2] bg-[#E8E8DE]">
                      {[
                        "Territory",
                        "Gross",
                        "Admissions",
                        "ATP",
                        "Shows",
                        "Occupancy",
                      ].map((heading) => (
                        <th key={heading} className={tableHeaderClass}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sortedStateRecords.map((record, index) => (
                      <tr key={record.id} className={tableRowClass}>
                        <td className={tableNameCellClass}>
                          <span className="inline-flex items-center justify-center">
                            {record.territory_name}
                            {index === 0 && <LeaderTrophy />}
                          </span>
                        </td>

                        <td className={tableGrossCellClass}>
                          {formatCollection(record.gross)}
                        </td>

                        <td className={tableNumberCellClass}>
                          {formatNumber(record.admissions)}
                        </td>

                        <td className={tableNumberCellClass}>
                          {formatMetric(record.atp)}
                        </td>

                        <td className={tableNumberCellClass}>
                          {formatNumber(record.show_count)}
                        </td>

                        <td className={tableOccupancyCellClass}>
                          {formatOccupancy(record.occupancy)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrapper>
            )}
          </div>

          {/* STATE NOTES */}

          {selectedData.records.some((record) => record.notes) && (
            <div className="mt-4 border-t border-zinc-900 bg-black/30 px-2 py-4 sm:px-3">
              <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-500">
                State Tracking Notes
              </p>

              <div className="mt-3 space-y-3">
                {selectedData.records
                  .filter((record) => record.notes)
                  .map((record) => (
                    <div
                      key={`state-note-${record.id}`}
                      className="border-l border-zinc-700 pl-3"
                    >
                      <p className="text-[9px] font-medium text-zinc-400">
                        {record.territory_name}
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-zinc-500">
                        {record.notes}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* LATEST UPDATE */}

          <div className="mt-3 border-t border-zinc-900 bg-black/30 px-2 py-3 sm:px-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[9px] text-zinc-500">
                Latest State-wise update for Day {selectedData.day}
              </p>

              <p className="text-[9px] text-zinc-500">
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
        <div className="mt-5 border-y border-pink-900/60 bg-zinc-950 px-3 py-4">
          <p className="text-[8px] uppercase tracking-[0.14em] text-violet-400">
            Understanding the Breakdowns
          </p>

          <p className="mt-2 text-[10px] leading-5 text-zinc-500">
            State-wise, Language-wise and Format-wise figures represent
            different classifications of advance booking activity.
            Their gross collections should not be added together.
            JMI displays each classification separately to avoid
            double-counting.
          </p>
        </div>
      )}

      {/* =====================================================
          CUMULATIVE TRACKING
      ===================================================== */}

      <section className="mt-10 border-t border-violet-800/50 pt-6">
        <div className="mb-5">
          <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
            All-Day Tracking Intelligence
          </p>

          <h2 className="mt-1 text-lg font-semibold text-yellow-500">
            Overall Cumulative Tracking
          </h2>

          <p className="mt-2 text-[10px] leading-5 text-zinc-500">
            Combined advance booking performance across all available
            tracking days. These figures are independent of the selected
            calendar date and are ranked by cumulative gross collection.
          </p>
        </div>

        {/* CUMULATIVE STATE-WISE */}

        <CumulativeTable
          title="Territory Intelligence"
          subtitle="Combined state and territory performance across all tracked days."
          firstColumn="Territory"
          records={cumulativeData.states}
        />

        {/* CUMULATIVE LANGUAGE-WISE */}

        <CumulativeTable
          title="Language Intelligence"
          subtitle="Combined language-wise advance booking performance across all tracked days."
          firstColumn="Language"
          records={cumulativeData.languages}
        />

        {/* CUMULATIVE FORMAT-WISE */}

        <CumulativeTable
          title="Exhibition Format Intelligence"
          subtitle="Combined exhibition-format performance across all tracked days."
          firstColumn="Format"
          records={cumulativeData.formats}
        />

        <div className="mt-5 border-y border-zinc-800 bg-zinc-950 px-3 py-4">
          <p className="text-[8px] uppercase tracking-[0.14em] text-violet-400">
            Cumulative Calculation Method
          </p>

          <p className="mt-2 text-[10px] leading-5 text-zinc-500">
            Gross, admissions and shows are summed across available
            tracking days. ATP is calculated as cumulative gross divided
            by cumulative admissions. Occupancy is calculated as a
            show-weighted average of the recorded daily occupancy
            percentages. This is an estimate of cumulative occupancy,
            not a seat-capacity-weighted industry occupancy figure.
          </p>
        </div>
      </section>
    </div>
  );
}
