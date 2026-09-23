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
  notes: string | null;
  updated_at: string;
};

type DayData = {
  day: number;
  date: string | null;
  records: BookingRecord[];
  gross: number;
  admissions: number;
  shows: number;
  latestUpdatedAt: string | null;
};

type Props = {
  days: DayData[];
};

function formatCollection(value: number | null) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (value === 0) {
    return "₹0";
  }

  return (
    "₹" +
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(value)
  );
}

function formatNumber(value: number | null) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN"
  ).format(value);
}

function formatDate(
  value: string | null
) {
  if (!value) {
    return "Date unavailable";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatShortDate(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}

function formatUpdatedAt(
  value: string | null
) {
  if (!value) {
    return "—";
  }

  return new Date(
    value
  ).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getMonthKey(
  date: string
) {
  const parsed =
    new Date(
      `${date}T00:00:00`
    );

  return `${parsed.getFullYear()}-${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getMonthLabel(
  monthKey: string
) {
  const [year, month] =
    monthKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    1
  ).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function getDaysInMonth(
  monthKey: string
) {
  const [year, month] =
    monthKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month,
    0
  ).getDate();
}

function getFirstWeekday(
  monthKey: string
) {
  const [year, month] =
    monthKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    1
  ).getDay();
}

export default function AdvanceBookingDayTable({
  days,
}: Props) {
  const availableDates =
    useMemo(() => {
      return days
        .filter(
          (day) =>
            Boolean(
              day.date
            )
        )
        .sort((a, b) => {
          return (
            new Date(
              `${a.date}T00:00:00`
            ).getTime() -
            new Date(
              `${b.date}T00:00:00`
            ).getTime()
          );
        });
    }, [days]);

  const firstAvailable =
    availableDates[0] || null;

  const [selectedDay, setSelectedDay] =
    useState<number>(
      firstAvailable?.day ??
        days[0]?.day ??
        0
    );

  const selectedData =
    days.find(
      (day) =>
        day.day === selectedDay
    ) || days[0] || null;

  const initialMonth =
    selectedData?.date
      ? getMonthKey(
          selectedData.date
        )
      : availableDates[0]?.date
        ? getMonthKey(
            availableDates[0].date
          )
        : "";

  const [calendarMonth, setCalendarMonth] =
    useState(initialMonth);

  const availableByDate =
    useMemo(() => {
      const map =
        new Map<
          string,
          DayData
        >();

      for (const day of days) {
        if (day.date) {
          map.set(
            day.date,
            day
          );
        }
      }

      return map;
    }, [days]);

  function selectDay(day: DayData) {
    setSelectedDay(day.day);

    if (day.date) {
      setCalendarMonth(
        getMonthKey(
          day.date
        )
      );
    }
  }

  function moveMonth(
    direction: number
  ) {
    if (!calendarMonth) {
      return;
    }

    const [year, month] =
      calendarMonth
        .split("-")
        .map(Number);

    const next =
      new Date(
        year,
        month - 1 + direction,
        1
      );

    setCalendarMonth(
      `${next.getFullYear()}-${String(
        next.getMonth() + 1
      ).padStart(2, "0")}`
    );
  }

  const calendarDays =
    calendarMonth
      ? Array.from(
          {
            length:
              getDaysInMonth(
                calendarMonth
              ),
          },
          (_, index) =>
            index + 1
        )
      : [];

  const firstWeekday =
    calendarMonth
      ? getFirstWeekday(
          calendarMonth
        )
      : 0;

  return (
    <div className="mt-7">

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <div className="mb-4">

        <p className="text-[8px] uppercase tracking-[0.18em] text-violet-400">
          Day-wise Intelligence
        </p>

        <h2 className="mt-1 text-sm font-medium text-yellow-500">
          Advance Booking Timeline
        </h2>

        <p className="mt-1 text-[9px] leading-5 text-zinc-500">
          Select a tracked date to view the
          territory-level advance booking
          performance for that day.
        </p>

      </div>


      {/* =====================================================
          CALENDAR SELECTOR
      ===================================================== */}

      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-[8px] uppercase tracking-[0.16em] text-violet-400">
              Tracking Calendar
            </p>

            <p className="mt-1 text-[9px] text-zinc-600">
              Highlighted dates have JMI
              advance booking data.
            </p>

          </div>

          {selectedData && (
            <div className="text-right">

              <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                Selected
              </p>

              <p className="mt-1 text-[9px] font-medium text-yellow-400">
                Day {selectedData.day}
              </p>

            </div>
          )}

        </div>


        {/* MONTH NAVIGATION */}

        {calendarMonth && (
          <div className="mt-5">

            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">

              <button
                type="button"
                onClick={() =>
                  moveMonth(-1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-200"
                aria-label="Previous month"
              >
                ←
              </button>

              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-300">
                {getMonthLabel(
                  calendarMonth
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  moveMonth(1)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-900 bg-black text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-200"
                aria-label="Next month"
              >
                →
              </button>

            </div>


            {/* WEEK LABELS */}

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
                  className="py-1 text-center text-[7px] uppercase tracking-[0.08em] text-zinc-700"
                >
                  {day}
                </div>
              ))}

            </div>


            {/* CALENDAR DAYS */}

            <div className="mt-1 grid grid-cols-7 gap-1">

              {Array.from({
                length:
                  firstWeekday,
              }).map(
                (_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="h-9"
                  />
                )
              )}

              {calendarDays.map(
                (dayNumber) => {

                  const date =
                    `${calendarMonth}-${String(
                      dayNumber
                    ).padStart(
                      2,
                      "0"
                    )}`;

                  const available =
                    availableByDate.get(
                      date
                    );

                  const selected =
                    available?.day ===
                    selectedDay;

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={
                        !available
                      }
                      onClick={() =>
                        available &&
                        selectDay(
                          available
                        )
                      }
                      className={`relative flex h-9 items-center justify-center rounded-lg text-[9px] transition ${
                        selected
                          ? "border border-yellow-500/50 bg-yellow-500/10 font-semibold text-yellow-400"
                          : available
                            ? "border border-violet-900/50 bg-violet-950/20 font-medium text-violet-300 hover:border-violet-700 hover:bg-violet-950/40"
                            : "border border-transparent text-zinc-800"
                      }`}
                    >
                      {dayNumber}

                      {available && (
                        <span
                          className={`absolute bottom-1 h-1 w-1 rounded-full ${
                            selected
                              ? "bg-yellow-400"
                              : "bg-violet-500"
                          }`}
                        />
                      )}
                    </button>
                  );
                }
              )}

            </div>

          </div>
        )}


        {/* =================================================
            QUICK DAY SELECTOR
        ================================================= */}

        <div className="mt-5 border-t border-zinc-900 pt-4">

          <p className="mb-2 text-[7px] uppercase tracking-[0.12em] text-zinc-500">
            Available Tracking Days
          </p>

          <div className="flex gap-2 overflow-x-auto pb-1">

            {days.map(
              (day) => {

                const selected =
                  day.day ===
                  selectedDay;

                return (
                  <button
                    key={
                      day.day
                    }
                    type="button"
                    onClick={() =>
                      selectDay(
                        day
                      )
                    }
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[8px] font-medium transition ${
                      selected
                        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                        : "border-zinc-900 bg-black text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <span className="block">
                      Day {day.day}
                    </span>

                    {day.date && (
                      <span className="mt-0.5 block text-[7px] text-zinc-700">
                        {formatShortDate(
                          day.date
                        )}
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

        </div>

      </div>


      {/* =====================================================
          SELECTED DAY
      ===================================================== */}

      {selectedData && (

        <section className="mt-5 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">

          {/* DAY HEADER */}

          <div className="border-b border-zinc-900 bg-zinc-950 px-4 py-4 sm:px-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h3 className="text-base font-medium text-zinc-100">
                    Day{" "}
                    {selectedData.day}
                  </h3>

                  {selectedData.day ===
                    0 && (
                    <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[8px] font-medium uppercase tracking-[0.12em] text-yellow-400">
                      Premiere Day
                    </span>
                  )}

                </div>

                <p className="mt-1 text-[10px] font-medium text-zinc-400">
                  {formatDate(
                    selectedData.date
                  )}
                </p>

                <p className="mt-1 text-[8px] text-zinc-600">
                  {selectedData.records.length}{" "}
                  territory record
                  {selectedData.records.length !==
                  1
                    ? "s"
                    : ""}
                </p>

              </div>


              {/* SELECTED DAY TOTALS */}

              <div className="grid grid-cols-3 gap-2">

                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">

                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-400">
                    Gross
                  </p>

                  <p className="mt-1 text-xs font-semibold text-yellow-400">
                    {formatCollection(
                      selectedData.gross
                    )}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">

                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-400">
                    Admissions
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-300">
                    {formatNumber(
                      selectedData.admissions
                    )}
                  </p>

                </div>

                <div className="rounded-lg border border-zinc-900 bg-black px-3 py-2">

                  <p className="text-[7px] uppercase tracking-[0.1em] text-zinc-400">
                    Shows
                  </p>

                  <p className="mt-1 text-xs font-semibold text-zinc-300">
                    {formatNumber(
                      selectedData.shows
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[420px] border-collapse border-zinc-400">

              <thead>

                <tr className="border-b border-zinc-500 bg-black/40">

                  <th className="px-4 py-3 text-left text-[7px] font-medium uppercase tracking-[0.12em] text-pink-400 sm:px-5">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left text-[7px] font-medium uppercase tracking-[0.12em] text-pink-400">
                    Territory
                  </th>

                  <th className="px-4 py-3 text-right text-[7px] font-medium uppercase tracking-[0.12em] text-pink-400">
                    Gross
                  </th>

                  <th className="px-4 py-3 text-right text-[7px] font-medium uppercase tracking-[0.12em] text-pink-400">
                    Admissions
                  </th>

                  <th className="px-4 py-3 text-right text-[7px] font-medium uppercase tracking-[0.12em] text-pink-400">
                    Shows
                  </th>

                </tr>

              </thead>

              <tbody>

                {selectedData.records.map(
                  (record) => (
                    <tr
                      key={
                        record.id
                      }
                      className="border-b border-zinc-900 last:border-b-0"
                    >

                      <td className="whitespace-nowrap px-4 py-4 text-[9px] text-zinc-400 sm:px-5">
                        {formatDate(
                          record.booking_date ||
                            selectedData.date
                        )}
                      </td>

                      <td className="px-4 py-4 sm:px-5">

                        <div className="flex items-center gap-2">

                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />

                          <div>

                            <p className="text-[9px] font-medium text-zinc-200">
                              {
                                record.territory_name
                              }
                            </p>

                            <p className="mt-1 text-[6px] uppercase tracking-[0.1em] text-zinc-500">
                              {record.coverage_type ===
                              "REST_OF_INDIA"
                                ? "National Coverage"
                                : "State Coverage"}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right text-[9px] font-semibold text-green-500">
                        {formatCollection(
                          record.gross
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right text-[10px] text-zinc-300">
                        {formatNumber(
                          record.admissions
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-right text-[10px] text-zinc-300">
                        {formatNumber(
                          record.show_count
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>


              {/* TABLE TOTAL */}

              <tfoot>

                <tr className="border-t border-zinc-800 bg-black/50">

                  <td
                    colSpan={2}
                    className="px-4 py-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-yellow-400 sm:px-5"
                  >
                    Day Total
                  </td>

                  <td className="px-4 py-4 text-right text-[9px] font-semibold text-yellow-400">
                    {formatCollection(
                      selectedData.gross
                    )}
                  </td>

                  <td className="px-4 py-4 text-right text-[10px] font-semibold text-zinc-200">
                    {formatNumber(
                      selectedData.admissions
                    )}
                  </td>

                  <td className="px-4 py-4 text-right text-[10px] font-semibold text-zinc-200">
                    {formatNumber(
                      selectedData.shows
                    )}
                  </td>

                </tr>

              </tfoot>

            </table>

          </div>


          {/* NOTES */}

          {selectedData.records.some(
            (record) =>
              record.notes
          ) && (

            <div className="border-t border-zinc-900 bg-black/30 px-4 py-4 sm:px-5">

              <p className="text-[7px] uppercase tracking-[0.12em] text-zinc-700">
                Tracking Notes
              </p>

              <div className="mt-2 space-y-2">

                {selectedData.records
                  .filter(
                    (record) =>
                      record.notes
                  )
                  .map(
                    (record) => (
                      <div
                        key={
                          `note-${record.id}`
                        }
                        className="border-l border-zinc-800 pl-3"
                      >

                        <p className="text-[8px] font-medium text-zinc-500">
                          {
                            record.territory_name
                          }
                        </p>

                        <p className="mt-1 text-[9px] leading-5 text-zinc-600">
                          {
                            record.notes
                          }
                        </p>

                      </div>
                    )
                  )}

              </div>

            </div>

          )}


          {/* UPDATE FOOTER */}

          <div className="border-t border-zinc-900 bg-black/40 px-4 py-3 sm:px-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-[8px] text-zinc-500">
                Latest update for Day{" "}
                {selectedData.day}
              </p>

              <p className="text-[8px] text-zinc-500">
                {formatUpdatedAt(
                  selectedData.latestUpdatedAt
                )}
              </p>

            </div>

          </div>

        </section>

      )}

    </div>
  );
}