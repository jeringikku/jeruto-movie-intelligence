"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";

type Movie = {
  id: number;
  title: string;
  release_date?: string | null;
};

type StateRecord = {
  id: number;
  name: string;
};

type DataType = "STATE" | "LANGUAGE" | "FORMAT";

type ImportRow = {
  name: string;
  gross: number;
  admissions: number;
  atp: number;
  show_count: number;
  occupancy: number;
  state_id?: number;
};

type ImportPanelState = {
  fileName: string;
  rows: ImportRow[];
  errors: string[];
  importing: boolean;
  success: string;
};

const EMPTY_PANEL: ImportPanelState = {
  fileName: "",
  rows: [],
  errors: [],
  importing: false,
  success: "",
};

const DATA_TYPES: {
  type: DataType;
  title: string;
  description: string;
  nameLabel: string;
  table: string;
}[] = [
  {
    type: "STATE",
    title: "State-wise Import",
    description: "Import collections for individual states and union territories.",
    nameLabel: "State",
    table: "movie_advance_booking_daily",
  },
  {
    type: "LANGUAGE",
    title: "Language-wise Import",
    description: "Import collections grouped by movie language.",
    nameLabel: "Language",
    table: "movie_advance_booking_language_daily",
  },
  {
    type: "FORMAT",
    title: "Format-wise Import",
    description: "Import collections grouped by exhibition format.",
    nameLabel: "Format",
    table: "movie_advance_booking_format_daily",
  },
];

function normalizeName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
}

function parseGross(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value)
    .trim()
    .replace(/[₹,\s]/g, "")
    .replace(/,/g, "");

  if (!text || text === "-" || text.toLowerCase() === "na") {
    return null;
  }

  let multiplier = 1;

  if (/cr(ore)?$/i.test(text)) {
    multiplier = 10000000;
    text = text.replace(/cr(ore)?$/i, "");
  } else if (/l(akh)?s?$/i.test(text)) {
    multiplier = 100000;
    text = text.replace(/l(akh)?s?$/i, "");
  } else if (/k$/i.test(text)) {
    multiplier = 1000;
    text = text.replace(/k$/i, "");
  }

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) return null;

  return parsed * multiplier;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value)
    .trim()
    .replace(/,/g, "")
    .replace(/[₹\s]/g, "")
    .replace(/^rs\.?/i, "")
    .replace(/^inr/i, "");

  if (!text || text === "-" || text.toLowerCase() === "na") {
    return null;
  }

  // Reject percentages here; they are handled separately.
  if (text.includes("%")) return null;

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseOccupancy(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Excel percentage cells generally return their decimal value
  // when XLSX is read with raw: true.
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value).trim();

  if (!text || text === "-" || text.toLowerCase() === "na") {
    return null;
  }

  const isPercentage = text.includes("%");

  text = text
    .replace(/%/g, "")
    .replace(/,/g, "")
    .trim();

  const parsed = Number(text);

  if (!Number.isFinite(parsed)) return null;

  // "35%" becomes 0.35; an Excel numeric value of 0.35
  // remains 0.35.
  return isPercentage ? parsed / 100 : parsed;
}

function getHeaderIndex(
  headers: string[],
  aliases: string[]
): number {
  return headers.findIndex((header) =>
    aliases.includes(normalizeName(header))
  );
}

function parseExcelFile(
  file: File,
  type: DataType,
  states: StateRecord[]
): Promise<{ rows: ImportRow[]; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;

        if (!data) {
          resolve({
            rows: [],
            errors: ["Could not read the selected Excel file."],
          });
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
          resolve({
            rows: [],
            errors: ["The Excel file does not contain a worksheet."],
          });
          return;
        }

        const worksheet = workbook.Sheets[sheetName];

       const sheetRows = XLSX.utils.sheet_to_json(
  worksheet,
  {
    header: 1,
    raw: true,
    defval: null,
  }
) as unknown[][];

        // Find the header row automatically.
        // The supplied Excel files have their headers on row 5.
        const headerRowIndex = sheetRows.findIndex((row) => {
          const headers = row.map((cell) => String(cell ?? ""));

          const nameIndex = getHeaderIndex(
            headers,
            type === "STATE"
              ? ["state"]
              : type === "LANGUAGE"
              ? ["language"]
              : ["format"]
          );

          const grossIndex = getHeaderIndex(headers, [
            "gross",
            "gross₹",
            "gross(rs)",
          ]);

          return nameIndex !== -1 && grossIndex !== -1;
        });

        if (headerRowIndex === -1) {
          resolve({
            rows: [],
            errors: [
              `Could not find the ${type.toLowerCase()} header row. Please check the Excel headings.`,
            ],
          });
          return;
        }

        const headers = sheetRows[headerRowIndex].map((cell) =>
          String(cell ?? "")
        );

        const nameIndex = getHeaderIndex(
          headers,
          type === "STATE"
            ? ["state"]
            : type === "LANGUAGE"
            ? ["language"]
            : ["format"]
        );

        const grossIndex = getHeaderIndex(headers, [
          "gross",
          "gross₹",
          "gross(rs)",
        ]);

        const admissionsIndex = getHeaderIndex(headers, [
          "tickets",
          "admissions",
        ]);

        const atpIndex = getHeaderIndex(headers, ["atp"]);

        const showsIndex = getHeaderIndex(headers, [
          "shows",
          "showcount",
        ]);

        const occupancyIndex = getHeaderIndex(headers, [
          "occ",
          "occupancy",
        ]);

        const missingColumns: string[] = [];

        if (nameIndex === -1) missingColumns.push("State/Language/Format");
        if (grossIndex === -1) missingColumns.push("GROSS");
        if (admissionsIndex === -1) missingColumns.push("TICKETS");
        if (atpIndex === -1) missingColumns.push("ATP");
        if (showsIndex === -1) missingColumns.push("SHOWS");
        if (occupancyIndex === -1) missingColumns.push("OCC");

        if (missingColumns.length > 0) {
          resolve({
            rows: [],
            errors: [
              `Missing required Excel columns: ${missingColumns.join(", ")}`,
            ],
          });
          return;
        }

        const stateMap = new Map<string, number>();

        states.forEach((state) => {
          stateMap.set(normalizeName(state.name), state.id);
        });

        const parsedRows: ImportRow[] = [];
        const errors: string[] = [];

        sheetRows.slice(headerRowIndex + 1).forEach((row, index) => {
          const originalRowNumber = headerRowIndex + index + 2;

          const name = String(row[nameIndex] ?? "").trim();

          if (!name) return;

          // Ignore aggregate/footer rows.
          if (normalizeName(name) === "total") return;

        const gross = parseGross(row[grossIndex]);
const admissions = parseNumber(row[admissionsIndex]);
const atp = parseNumber(row[atpIndex]);
const showCount = parseNumber(row[showsIndex]);
const occupancy = parseOccupancy(row[occupancyIndex]);

         const invalidFields: string[] = [];

if (gross === null) invalidFields.push("Gross");
if (admissions === null) invalidFields.push("Tickets/Admissions");
if (atp === null) invalidFields.push("ATP");
if (showCount === null) invalidFields.push("Shows");
if (occupancy === null) invalidFields.push("Occupancy");

if (invalidFields.length > 0) {
  errors.push(
    `Row ${originalRowNumber} (${name}): invalid or missing ${invalidFields.join(", ")}.`
  );
  return;
}

// Explicit null check for TypeScript
if (
  gross === null ||
  admissions === null ||
  atp === null ||
  showCount === null ||
  occupancy === null
) {
  return;
}

// Reject negative values
if (
  gross < 0 ||
  admissions < 0 ||
  atp < 0 ||
  showCount < 0 ||
  occupancy < 0
) {
  errors.push(
    `Row ${originalRowNumber} (${name}): negative values are not allowed.`
  );
  return;
}

// Occupancy must be between 0 and 1
if (occupancy > 1) {
  errors.push(
    `Row ${originalRowNumber} (${name}): Occupancy must be between 0 and 1, or entered as a percentage such as 35%.`
  );
  return;
}

const importedRow: ImportRow = {
  name,
  gross,
  admissions: Math.round(admissions),
  atp,
  show_count: Math.round(showCount),
  occupancy,
};

          if (occupancy > 1) {
  errors.push(
    `Row ${originalRowNumber} (${name}): Occupancy must be between 0 and 1, or entered as a percentage such as 35%.`
  );
  return;
}

          if (type === "STATE") {
            const stateId = stateMap.get(normalizeName(name));

            if (!stateId) {
              errors.push(
                `Row ${originalRowNumber}: "${name}" was not found in your States master table.`
              );
              return;
            }

            importedRow.state_id = stateId;
          }

          parsedRows.push(importedRow);
        });

        if (parsedRows.length === 0 && errors.length === 0) {
          errors.push("No valid data rows were found in this Excel file.");
        }

        resolve({
          rows: parsedRows,
          errors,
        });
      } catch (error) {
        resolve({
          rows: [],
          errors: [
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while reading the Excel file.",
          ],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        rows: [],
        errors: ["Unable to read the selected file."],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

function formatCurrency(value: number): string {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function createTodayDate(): string {
  const now = new Date();
  const local = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AdvanceBookingImportPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [states, setStates] = useState<StateRecord[]>([]);

  const [selectedMovie, setSelectedMovie] = useState("");

  const [movieSearch, setMovieSearch] = useState("");
const [movieDropdownOpen, setMovieDropdownOpen] = useState(false);

  const [bookingDay, setBookingDay] = useState("0");
  const [bookingDate, setBookingDate] = useState(createTodayDate());

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageMessage, setPageMessage] = useState("");

  const [panels, setPanels] = useState<
    Record<DataType, ImportPanelState>
  >({
    STATE: { ...EMPTY_PANEL },
    LANGUAGE: { ...EMPTY_PANEL },
    FORMAT: { ...EMPTY_PANEL },
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  async function loadMasterData() {
    setLoading(true);
    setPageError("");

    try {
      const [moviesResult, statesResult] = await Promise.all([
        supabase
          .from("movies")
          .select("id,title,release_date")
          .order("title", { ascending: true }),

        supabase
          .from("states")
          .select("id,name")
          .order("name", { ascending: true }),
      ]);

      if (moviesResult.error) throw moviesResult.error;
      if (statesResult.error) throw statesResult.error;

      setMovies((moviesResult.data ?? []) as Movie[]);
      setStates((statesResult.data ?? []) as StateRecord[]);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Unable to load movies and states."
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedMovieDetails = useMemo(
    () => movies.find((movie) => String(movie.id) === selectedMovie),
    [movies, selectedMovie]
  );

  function updatePanel(
    type: DataType,
    updates: Partial<ImportPanelState>
  ) {
    setPanels((previous) => ({
      ...previous,
      [type]: {
        ...previous[type],
        ...updates,
      },
    }));
  }

  const filteredMovies = useMemo(() => {
  const query = movieSearch.trim().toLowerCase();

  if (!query) return movies;

  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(query)
  );
}, [movies, movieSearch]);

  async function handleFileChange(
    type: DataType,
    file?: File
  ) {
    if (!file) return;

    updatePanel(type, {
      fileName: file.name,
      rows: [],
      errors: [],
      success: "",
    });

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["xlsx", "xls", "xlsm"].includes(extension ?? "")) {
      updatePanel(type, {
        errors: ["Please upload an Excel file (.xlsx or .xls)."],
      });
      return;
    }

    const result = await parseExcelFile(file, type, states);

    updatePanel(type, {
      rows: result.rows,
      errors: result.errors,
      success: "",
    });
  }

  async function importCategory(type: DataType) {
    if (!selectedMovie) {
      setPageError("Please select a movie first.");
      return;
    }

    if (!bookingDate) {
      setPageError("Please select the booking date.");
      return;
    }

    const day = Number(bookingDay);

    if (!Number.isInteger(day) || day < 0) {
      setPageError("Please enter a valid booking day.");
      return;
    }

    const panel = panels[type];

    if (panel.rows.length === 0) {
      setPageError("There are no valid rows to import.");
      return;
    }

    if (panel.errors.length > 0) {
      setPageError(
        "Please correct the Excel validation errors before importing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Import ${panel.rows.length} ${type.toLowerCase()} records for ${selectedMovieDetails?.title ?? "the selected movie"}, Day ${day}?\n\nOnly existing ${type.toLowerCase()} records for this movie and booking day will be replaced. Other categories and booking days will remain untouched.`
    );

    if (!confirmed) return;

    updatePanel(type, {
      importing: true,
      success: "",
    });

    setPageError("");
    setPageMessage("");

    try {
      const rpcRows = panel.rows.map((row) => {
        if (type === "STATE") {
          return {
            state_id: row.state_id,
            gross: row.gross,
            admissions: row.admissions,
            atp: row.atp,
            show_count: row.show_count,
            occupancy: row.occupancy,
            notes: null,
          };
        }

        if (type === "LANGUAGE") {
          return {
            language: row.name,
            gross: row.gross,
            admissions: row.admissions,
            atp: row.atp,
            show_count: row.show_count,
            occupancy: row.occupancy,
            notes: null,
          };
        }

        return {
          format: row.name,
          gross: row.gross,
          admissions: row.admissions,
          atp: row.atp,
          show_count: row.show_count,
          occupancy: row.occupancy,
          notes: null,
        };
      });

      const { error } = await supabase.rpc(
        "jmi_import_advance_booking",
        {
          p_movie_id: Number(selectedMovie),
          p_booking_day: day,
          p_booking_date: bookingDate,
          p_data_type: type,
          p_rows: rpcRows,
        }
      );

      if (error) throw error;

      updatePanel(type, {
        importing: false,
        success: `${panel.rows.length} records imported successfully.`,
        rows: [],
        errors: [],
        fileName: "",
      });

      setPageMessage(
        `${type} import completed for ${selectedMovieDetails?.title}, Day ${day}.`
      );
    } catch (error) {
      updatePanel(type, { importing: false });

      setPageError(
        error instanceof Error
          ? error.message
          : "The import failed. Existing data has not been intentionally cleared."
      );
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none focus:border-violet-500";

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-none">
        <div className="mb-7 border-b border-zinc-800 pb-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded bg-violet-500/15 px-2 py-1 text-[10px] font-bold tracking-widest text-violet-300">
              JMI ADMIN
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500">
              DATA MANAGEMENT
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Advance Booking Excel Import
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Import State-wise, Language-wise and Format-wise advance
            booking reports independently. Preview and validate each
            Excel file before saving it to JMI.
          </p>
        </div>

        {pageError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {pageError}
          </div>
        )}

        {pageMessage && (
          <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
            {pageMessage}
          </div>
        )}

        <section className="mb-7 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-violet-300">
              Import Configuration
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Select the movie and the exact booking day before uploading
              any files.
            </p>
          </div>

          {loading ? (
            <p className="py-5 text-sm text-zinc-400">
              Loading movies and states...
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  SELECT MOVIE
                </label>
               <div className="relative">
  <input
    type="text"
    className={inputClass}
    placeholder="Search movie by title..."
    value={movieSearch}
    onFocus={() => setMovieDropdownOpen(true)}
    onChange={(event) => {
      setMovieSearch(event.target.value);
      setMovieDropdownOpen(true);
      setSelectedMovie("");
      setPageError("");
      setPageMessage("");
    }}
    onKeyDown={(event) => {
      if (event.key === "Escape") {
        setMovieDropdownOpen(false);
      }

      if (event.key === "Enter" && filteredMovies.length > 0) {
        event.preventDefault();

        const movie = filteredMovies[0];
        setSelectedMovie(String(movie.id));
        setMovieSearch(movie.title);
        setMovieDropdownOpen(false);
      }
    }}
  />

  {movieDropdownOpen && (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl">
      {filteredMovies.length > 0 ? (
        filteredMovies.map((movie) => (
          <button
            key={movie.id}
            type="button"
            onClick={() => {
              setSelectedMovie(String(movie.id));
              setMovieSearch(movie.title);
              setMovieDropdownOpen(false);
              setPageError("");
              setPageMessage("");
            }}
            className={`block w-full border-b border-zinc-800 px-4 py-3 text-left text-sm transition hover:bg-violet-500/10 ${
              selectedMovie === String(movie.id)
                ? "bg-violet-500/10 text-violet-300"
                : "text-zinc-200"
            }`}
          >
            {movie.title}
          </button>
        ))
      ) : (
        <p className="px-4 py-4 text-center text-xs text-zinc-500">
          No matching movies found.
        </p>
      )}
    </div>
  )}
</div>

{selectedMovie && selectedMovieDetails && (
  <p className="mt-2 text-xs text-emerald-400">
    Selected: {selectedMovieDetails.title}
  </p>
)}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  BOOKING DAY
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={bookingDay}
                  onChange={(event) => setBookingDay(event.target.value)}
                  placeholder="Example: 1"
                />
                <p className="mt-1 text-[10px] text-zinc-600">
                  Day 0 can be used for advance booking before release.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-zinc-400">
                  BOOKING DATE
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                />
              </div>
            </div>
          )}

          {selectedMovieDetails && (
            <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
                Selected Movie
              </p>
              <p className="mt-1 text-sm font-bold">
                {selectedMovieDetails.title}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Day {bookingDay || "0"} · {bookingDate || "Date not selected"}
              </p>
            </div>
          )}
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">Excel Upload Sections</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Each category is imported separately.
            </p>
          </div>
          <span className="rounded-full border border-zinc-700 px-3 py-1 text-[10px] font-semibold text-zinc-400">
            3 INDEPENDENT IMPORTS
          </span>
        </div>

        <div className="space-y-6">
          {DATA_TYPES.map((item) => {
            const panel = panels[item.type];

            return (
              <section
                key={item.type}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
              >
                <div className="border-b border-zinc-800 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                    <span className="rounded-md border border-zinc-700 px-2 py-1 text-[10px] font-semibold tracking-wider text-zinc-400">
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-semibold text-zinc-400">
                      UPLOAD {item.type} EXCEL FILE
                    </label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.xlsm"
                      disabled={loading || !selectedMovie}
                      onChange={(event) =>
                        handleFileChange(
                          item.type,
                          event.target.files?.[0]
                        )
                      }
                      className="block w-full cursor-pointer rounded-lg border border-zinc-700 bg-black text-xs text-zinc-300 file:mr-3 file:border-0 file:bg-violet-600 file:px-4 file:py-3 file:text-xs file:font-bold file:text-white hover:file:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    {!selectedMovie && (
                      <p className="mt-2 text-[10px] text-amber-400">
                        Select a movie above before uploading.
                      </p>
                    )}
                    {panel.fileName && (
                      <p className="mt-2 break-all text-xs text-zinc-400">
                        Selected file: {panel.fileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {panel.errors.length > 0 && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                      <p className="mb-2 text-xs font-bold text-red-300">
                        Validation errors
                      </p>
                      <ul className="space-y-1 text-xs text-red-300">
                        {panel.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {panel.success && (
                    <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                      {panel.success}
                    </div>
                  )}

                  {panel.rows.length > 0 && (
                    <>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-emerald-300">
                            Preview ready
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {panel.rows.length} valid records detected.
                          </p>
                        </div>
                        <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                          VALID ROWS
                        </span>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-black p-3">
                          <p className="text-[10px] text-zinc-500">
                            RECORDS
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {panel.rows.length}
                          </p>
                        </div>
                        <div className="rounded-lg bg-black p-3">
                          <p className="text-[10px] text-zinc-500">
                            TOTAL GROSS
                          </p>
                          <p className="mt-1 text-sm font-bold text-yellow-300">
                            {formatCurrency(
                              panel.rows.reduce(
                                (sum, row) => sum + row.gross,
                                0
                              )
                            )}
                          </p>
                        </div>
                        <div className="rounded-lg bg-black p-3">
                          <p className="text-[10px] text-zinc-500">
                            ADMISSIONS
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {panel.rows
                              .reduce(
                                (sum, row) => sum + row.admissions,
                                0
                              )
                              .toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="rounded-lg bg-black p-3">
                          <p className="text-[10px] text-zinc-500">
                            TOTAL SHOWS
                          </p>
                          <p className="mt-1 text-lg font-bold text-white">
                            {panel.rows
                              .reduce(
                                (sum, row) => sum + row.show_count,
                                0
                              )
                              .toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-zinc-800">
                        <table className="w-full min-w-[720px] text-left text-xs">
                          <thead className="bg-black text-[10px] uppercase tracking-wider text-zinc-500">
                            <tr>
                              <th className="px-3 py-3">
                                {item.nameLabel}
                              </th>
                              <th className="px-3 py-3 text-right">
                                Gross
                              </th>
                              <th className="px-3 py-3 text-right">
                                Tickets
                              </th>
                              <th className="px-3 py-3 text-right">
                                ATP
                              </th>
                              <th className="px-3 py-3 text-right">
                                Shows
                              </th>
                              <th className="px-3 py-3 text-right">
                                Occupancy
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {panel.rows.map((row, index) => (
                              <tr
                                key={`${row.name}-${index}`}
                                className="border-t border-zinc-800"
                              >
                                <td className="px-3 py-3 font-semibold text-white">
                                  {row.name}
                                </td>
                                <td className="px-3 py-3 text-right text-yellow-300">
                                  {formatCurrency(row.gross)}
                                </td>
                                <td className="px-3 py-3 text-right text-zinc-300">
                                  {row.admissions.toLocaleString("en-IN")}
                                </td>
                                <td className="px-3 py-3 text-right text-zinc-300">
                                  {row.atp.toLocaleString("en-IN")}
                                </td>
                                <td className="px-3 py-3 text-right text-zinc-300">
                                  {row.show_count.toLocaleString("en-IN")}
                                </td>
                                <td className="px-3 py-3 text-right text-zinc-300">
                                  {row.occupancy}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[10px] leading-5 text-zinc-500">
                          The percentage column and final Total row are
                          excluded. Imported values are not recalculated.
                        </p>

                        <button
                          type="button"
                          disabled={
                            panel.importing ||
                            !selectedMovie ||
                            !bookingDate ||
                            panel.errors.length > 0
                          }
                          onClick={() => importCategory(item.type)}
                          className="rounded-lg bg-violet-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {panel.importing
                            ? "IMPORTING..."
                            : `IMPORT ${item.type} DATA`}
                        </button>
                      </div>
                    </>
                  )}

                  {panel.rows.length === 0 &&
                    panel.errors.length === 0 &&
                    !panel.success && (
                      <p className="py-3 text-center text-xs text-zinc-600">
                        Select an Excel file to preview its records here.
                      </p>
                    )}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-7 rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Import protection
          </h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
            <li>• Only the selected movie and booking day are affected.</li>
            <li>• Each category is imported independently.</li>
            <li>• Other booking days are preserved.</li>
            <li>• The percentage column is ignored.</li>
            <li>• The Excel Total row is not imported.</li>
            <li>• State names must match the States master table.</li>
            <li>• Gross, ATP, admissions, shows and occupancy are stored as supplied, with currency units converted to rupees where necessary.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}