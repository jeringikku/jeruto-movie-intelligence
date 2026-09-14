"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";

import AddMovieBusinessModal from "@/components/movie-business/AddMovieBusinessModal";
import { EditMovieBusinessModal } from "@/components/movie-business/EditMovieBusinessModal";

type MovieBusiness = {
  id: number;
  movie_id: number;

  production_budget_official: number | null;
  production_budget_trade: number | null;
  p_and_a_cost: number | null;
  total_investment: number | null;

  worldwide_rights_official: number | null;
  worldwide_rights_trade: number | null;

  ott_rights: number | null;
  satellite_rights: number | null;
  digital_rights: number | null;
  music_rights: number | null;
  remake_rights: number | null;
  audio_rights: number | null;
  airline_rights: number | null;
  in_flight_rights: number | null;
  other_rights: number | null;

  total_theatrical_share: number | null;
  total_non_theatrical: number | null;
  overall_recovery: number | null;
  producer_profit_loss: number | null;
  recovery_percentage: number | null;

  theatrical_verdict: string | null;
business_verdict: string | null;
  confidence_level: string | null;
  source: string | null;
  notes: string | null;

  currency: string | null;
  calculation_locked: boolean;

  movie: {
    title: string;
  } | null;
};

export default function MovieBusinessPage() {

  const searchParams = useSearchParams();
  const movieIdParam = searchParams.get("movieId");
const selectedMovieId = movieIdParam
  ? Number(movieIdParam)
  : null;

  
  const [businessData, setBusinessData] = useState<MovieBusiness[]>([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);



  const [editingBusiness, setEditingBusiness] =
  useState<MovieBusiness | null>(null);

  useEffect(() => {
    loadBusinessData();
  }, []);

  useEffect(() => {
  if (selectedMovieId) {
    setAddOpen(true);
  }
}, [selectedMovieId]);

  async function loadBusinessData() {
    const { data, error } = await supabase
      .from("movie_business")
      .select("*, movie:movies(title)")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (data) {
      setBusinessData(data as unknown as MovieBusiness[]);
    }
  }

  async function handleDelete(id: number, movieTitle: string) {
  const confirmed = window.confirm( `Are you sure you want to delete the business data for "${movieTitle}"?`
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabase
    .from("movie_business")
    .delete()
    .eq("id", id); 

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  alert("Movie business data deleted successfully!");

  loadBusinessData();
}

 

  function formatMoney(
    value: number | null,
    currency: string | null
  ) {
    if (value === null || value === undefined) {
      return "—";
    }

    return (
      (currency ?? "₹") +
      " " +
      Number(value).toLocaleString("en-IN")
    );
  }

  const filteredData = businessData.filter((item) =>
    (item.movie?.title ?? "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  
  return (
    <div className="min-h-screen bg-black p-8 text-white">

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Movie Business
          </h1>

          <p className="mt-1 text-sm text-zinc-400">
            Financial and business intelligence of movies
          </p>
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-black"
        >
          + Add Business Data
        </button>

      </div>

      <div className="relative mb-6 max-w-md">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Movies..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-3 pl-10 pr-4 text-white"
        />

      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-700">

        <table className="w-full min-w-[1200px]">

          <thead className="bg-zinc-800">

            <tr>

              <th className="p-4 text-left">
                ID
              </th>

              <th className="p-4 text-left">
                Movie
              </th>

              <th className="p-4 text-left">
                Budget
              </th>

              <th className="p-4 text-left">
                Investment
              </th>

              <th className="p-4 text-left">
                Worldwide Rights
              </th>

              <th className="p-4 text-left">
                OTT
              </th>

              <th className="p-4 text-left">
                Recovery
              </th>

              <th className="p-4 text-left">
                Recovery %
              </th>

             <th className="p-4 text-left">
  Theatrical Verdict
</th>

<th className="p-4 text-left">
  Business Verdict
</th>
              <th className="p-4 text-left">
                Confidence
              </th>

              <th className="p-4 text-left">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map((item) => (

              <tr
                key={item.id}
                className="border-t border-zinc-700"
              >

                <td className="p-4">
                  {item.id}
                </td>

                <td className="p-4 font-semibold">
                  {item.movie?.title ?? "Unknown Movie"}
                </td>

                <td className="p-4">
                  {formatMoney(
                    item.production_budget_trade ??
                      item.production_budget_official,
                    item.currency
                  )}
                </td>

                <td className="p-4">
                  {formatMoney(
                    item.total_investment,
                    item.currency
                  )}
                </td>

                <td className="p-4">
                  {formatMoney(
                    item.worldwide_rights_trade ??
                      item.worldwide_rights_official,
                    item.currency
                  )}
                </td>

                <td className="p-4">
                  {formatMoney(
                    item.ott_rights,
                    item.currency
                  )}
                </td>

                <td className="p-4">
                  {formatMoney(
                    item.overall_recovery,
                    item.currency
                  )}
                </td>

                <td className="p-4">
                  {item.recovery_percentage !== null
                    ? item.recovery_percentage + "%"
                    : "—"}
                </td>

                <td className="p-4">
  {item.theatrical_verdict ?? "—"}
</td>

<td className="p-4">
  {item.business_verdict ?? "—"}
</td>

                <td className="p-4">
                  {item.confidence_level ?? "—"}
                </td>

               <td className="p-4">
  <div className="flex gap-2">

    <button
      onClick={() => {
        setEditingBusiness(item);
        setEditOpen(true);
      }}
      className="rounded bg-blue-600 px-3 py-1 text-sm"
    >
      Edit
    </button>

    <button
      onClick={() =>
        handleDelete(
          item.id,
          item.movie?.title ?? "this movie"
        )
      }
      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
    >
      Delete
    </button>

  </div>
</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {filteredData.length === 0 && (
        <div className="mt-8 rounded-xl border border-zinc-700 p-10 text-center text-zinc-400">
          No business records found.
        </div>
      )}

    <AddMovieBusinessModal
  open={addOpen}
  onClose={() => setAddOpen(false)}
  onSaved={() => {
    loadBusinessData();
    setAddOpen(false);
  }}
  initialMovieId={selectedMovieId}
/>

      <EditMovieBusinessModal
  open={editOpen}
  business={editingBusiness}
  onClose={() => {
    setEditOpen(false);
    setEditingBusiness(null);
  }}
  onSaved={() => {
    loadBusinessData();
    setEditOpen(false);
    setEditingBusiness(null);
  }}
/>

    </div>
  );
}