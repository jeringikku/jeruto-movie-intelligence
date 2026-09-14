"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EntityType = "movies" | "people" | "companies" | "industries";

type Entity = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
};

type Props = {
  onSelectionChange?: (
    first: Entity | null,
    second: Entity | null,
    type: EntityType
  ) => void;

  onCompare?: () => void;
};

const ENTITY_TYPES: {
  value: EntityType;
  label: string;
}[] = [
  { value: "movies", label: "Movies" },
  { value: "people", label: "People" },
  { value: "companies", label: "Companies" },
  { value: "industries", label: "Industries" },
];

export default function JmiComparisonSelector({
  onSelectionChange,
  onCompare,
}: Props) {
  const [entityType, setEntityType] = useState<EntityType>("movies");

  const [first, setFirst] = useState<Entity | null>(null);
  const [second, setSecond] = useState<Entity | null>(null);

  const [firstQuery, setFirstQuery] = useState("");
  const [secondQuery, setSecondQuery] = useState("");

  const [firstResults, setFirstResults] = useState<Entity[]>([]);
  const [secondResults, setSecondResults] = useState<Entity[]>([]);

  const [firstLoading, setFirstLoading] = useState(false);
  const [secondLoading, setSecondLoading] = useState(false);

  const [activeSearch, setActiveSearch] = useState<"first" | "second" | null>(
    null
  );

  useEffect(() => {
    setFirst(null);
    setSecond(null);
    setFirstQuery("");
    setSecondQuery("");
    setFirstResults([]);
    setSecondResults([]);
    setActiveSearch(null);
  }, [entityType]);

  useEffect(() => {
    onSelectionChange?.(first, second, entityType);
  }, [first, second, entityType, onSelectionChange]);

  async function searchEntities(
    type: EntityType,
    query: string,
    setter: (items: Entity[]) => void,
    setLoading: (value: boolean) => void
  ) {
    if (query.trim().length < 2) {
      setter([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    let table = type;

    const searchColumn =
  type === "movies"
    ? "title"
    : type === "people"
    ? "full_name"
    : "name";

const { data, error } = await supabase
  .from(table)
  .select("*")
  .ilike(
    searchColumn,
    `%${query.trim()}%`
  )
  .limit(8);

    if (error) {
      console.error("JMI comparison search error:", error);
      setter([]);
      setLoading(false);
      return;
    }

    const results: Entity[] =
      (data ?? []).map((row: any) => ({
        id: row.id,
        title:
  type === "movies"
    ? row.title
    : type === "people"
    ? row.full_name
    : row.name,
        subtitle:
          type === "movies"
            ? [
                row.release_year ? String(row.release_year) : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined,
        image:
          type === "movies"
            ? row.poster_url ?? null
            : null,
      }));

    setter(results);
    setLoading(false);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchEntities(
        entityType,
        firstQuery,
        setFirstResults,
        setFirstLoading
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [firstQuery, entityType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchEntities(
        entityType,
        secondQuery,
        setSecondResults,
        setSecondLoading
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [secondQuery, entityType]);

  function chooseFirst(entity: Entity) {
    if (second?.id === entity.id) {
      setSecond(null);
      setSecondQuery("");
    }

    setFirst(entity);
    setFirstQuery("");
    setFirstResults([]);
    setActiveSearch(null);
  }

  function chooseSecond(entity: Entity) {
    if (first?.id === entity.id) {
      setFirst(null);
      setFirstQuery("");
    }

    setSecond(entity);
    setSecondQuery("");
    setSecondResults([]);
    setActiveSearch(null);
  }

  const canCompare =
    first !== null &&
    second !== null &&
    first.id !== second.id;

  return (
    <div className="space-y-5">

      {/* =====================================================
          ENTITY TYPE
      ===================================================== */}

      <div className="flex flex-wrap justify-center gap-1.5">

        {ENTITY_TYPES.map((type) => {
          const active = entityType === type.value;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setEntityType(type.value)}
              className={`
                rounded-md
                border
                px-3
                py-1.5
                text-[9px]
                font-medium
                transition
                ${
                  active
                    ? "border-violet-400/40 bg-violet-500/[0.10] text-violet-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
                }
              `}
            >
              {type.label}
            </button>
          );
        })}

      </div>


      {/* =====================================================
          SELECTORS
      ===================================================== */}

      <div className="grid items-start gap-3 md:grid-cols-[1fr_auto_1fr]">

        <SearchBox
          number="01"
          selected={first}
          query={firstQuery}
          results={firstResults}
          loading={firstLoading}
          active={activeSearch === "first"}
          placeholder={`Search ${entityType}...`}
          onFocus={() => setActiveSearch("first")}
          onQueryChange={(value) => {
            setFirstQuery(value);
            setFirst(null);
          }}
          onSelect={chooseFirst}
          onClear={() => {
            setFirst(null);
            setFirstQuery("");
            setFirstResults([]);
          }}
        />


        <div className="mx-auto mt-8 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-400/25 bg-violet-500/[0.04] md:mt-10">

          <span className="text-[9px] font-semibold tracking-[0.15em] text-violet-400">
            VS
          </span>

        </div>


        <SearchBox
          number="02"
          selected={second}
          query={secondQuery}
          results={secondResults}
          loading={secondLoading}
          active={activeSearch === "second"}
          placeholder={`Search ${entityType}...`}
          onFocus={() => setActiveSearch("second")}
          onQueryChange={(value) => {
            setSecondQuery(value);
            setSecond(null);
          }}
          onSelect={chooseSecond}
          onClear={() => {
            setSecond(null);
            setSecondQuery("");
            setSecondResults([]);
          }}
        />

      </div>


      {/* =====================================================
          COMPARE
      ===================================================== */}

      <div className="text-center">

        <button
          type="button"
          disabled={!canCompare}
          onClick={onCompare}
          className={`
            inline-flex
            h-10
            items-center
            justify-center
            rounded-lg
            border
            px-7
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.2em]
            transition
            ${
              canCompare
                ? "border-violet-400/40 bg-violet-500/[0.12] text-violet-200 hover:border-violet-300 hover:bg-violet-500/[0.18]"
                : "border-violet-400/20 bg-violet-500/[0.04] text-violet-300 opacity-50"
            }
          `}
        >
          Compare
        </button>

        <p className="mt-2 text-[8px] text-zinc-700">
          {canCompare
            ? "Ready to generate comparison intelligence"
            : "Select two different entities to compare"}

        </p>

      </div>

    </div>
  );
}


/* ============================================================
   SEARCH BOX
============================================================ */

function SearchBox({
  number,
  selected,
  query,
  results,
  loading,
  active,
  placeholder,
  onFocus,
  onQueryChange,
  onSelect,
  onClear,
}: {
  number: string;
  selected: Entity | null;
  query: string;
  results: Entity[];
  loading: boolean;
  active: boolean;
  placeholder: string;
  onFocus: () => void;
  onQueryChange: (value: string) => void;
  onSelect: (entity: Entity) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5">

      <div className="flex items-center justify-between">

        <span className="text-[8px] font-medium tracking-[0.25em] text-violet-400/50">
          {number}
        </span>

        <span className="text-[9px] text-zinc-700">
          JMI
        </span>

      </div>


      {selected ? (

        <div className="mt-4 flex items-center gap-3">

          {selected.image ? (
            <img
              src={selected.image}
              alt=""
              className="h-12 w-9 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md border border-violet-400/15 bg-violet-500/[0.04]">
              <span className="text-[10px] text-violet-400">
                JMI
              </span>
            </div>
          )}

          <div className="min-w-0 flex-1">

            <p className="truncate text-[11px] font-medium text-zinc-200">
              {selected.title}
            </p>

            {selected.subtitle && (
              <p className="mt-1 text-[8px] text-zinc-600">
                {selected.subtitle}
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[9px] text-zinc-600 hover:text-zinc-300"
          >
            Change
          </button>

        </div>

      ) : (

        <div className="relative mt-4">

          <div className={`
            flex
            items-center
            gap-2
            rounded-lg
            border
            bg-black
            px-3
            py-2.5
            transition
            ${
              active
                ? "border-violet-400/30"
                : "border-zinc-800"
            }
          `}>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-violet-400/60"
            >
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="text"
              value={query}
              placeholder={placeholder}
              onFocus={onFocus}
              onChange={(event) =>
                onQueryChange(event.target.value)
              }
              className="min-w-0 flex-1 bg-transparent text-[10px] text-zinc-300 outline-none placeholder:text-zinc-700"
            />

            {loading && (
              <span className="text-[8px] text-zinc-600">
                Searching…
              </span>
            )}

          </div>


          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          {active && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl">

              {results.length > 0 ? (

                <div className="max-h-72 overflow-y-auto">

                  {results.map((entity) => (

                    <button
                      key={entity.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => onSelect(entity)}
                      className="flex w-full items-center gap-3 border-b border-zinc-900 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-violet-500/[0.05]"
                    >

                      {entity.image ? (
                        <img
                          src={entity.image}
                          alt=""
                          className="h-10 w-7 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-7 shrink-0 items-center justify-center rounded border border-zinc-800 bg-black">
                          <span className="text-[7px] text-zinc-600">
                            JMI
                          </span>
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="truncate text-[10px] font-medium text-zinc-300">
                          {entity.title}
                        </p>

                        {entity.subtitle && (
                          <p className="mt-0.5 text-[8px] text-zinc-600">
                            {entity.subtitle}
                          </p>
                        )}

                      </div>

                    </button>

                  ))}

                </div>

              ) : !loading ? (

                <div className="px-4 py-5 text-center text-[9px] text-zinc-700">
                  No matching records found.
                </div>

              ) : null}

            </div>
          )}

        </div>

      )}

    </div>
  );
}