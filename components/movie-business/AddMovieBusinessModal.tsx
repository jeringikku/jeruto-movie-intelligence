"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initialMovieId?: number | null;
};

export default function AddMovieBusinessModal({
  open,
  onClose,
  onSaved,
  initialMovieId,
}: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [movieId, setMovieId] = useState("");

  const [productionBudgetOfficial, setProductionBudgetOfficial] =
    useState("");
  const [productionBudgetTrade, setProductionBudgetTrade] =
    useState("");
  const [pAndACost, setPAndACost] = useState("");
  const [totalInvestment, setTotalInvestment] = useState("");

  const [worldwideRightsOfficial, setWorldwideRightsOfficial] =
    useState("");
  const [worldwideRightsTrade, setWorldwideRightsTrade] =
    useState("");

  const [ottRights, setOttRights] = useState("");
  const [satelliteRights, setSatelliteRights] = useState("");
  const [digitalRights, setDigitalRights] = useState("");
  const [musicRights, setMusicRights] = useState("");
  const [remakeRights, setRemakeRights] = useState("");
  const [audioRights, setAudioRights] = useState("");
  const [airlineRights, setAirlineRights] = useState("");
  const [inFlightRights, setInFlightRights] = useState("");
  const [otherRights, setOtherRights] = useState("");

  const [totalTheatricalShare, setTotalTheatricalShare] =
    useState("");
  const [totalNonTheatrical, setTotalNonTheatrical] =
    useState("");
  const [overallRecovery, setOverallRecovery] = useState("");
  const [producerProfitLoss, setProducerProfitLoss] =
    useState("");
  const [recoveryPercentage, setRecoveryPercentage] =
    useState("");

  const [theatricalVerdict, setTheatricalVerdict] = useState("");
const [businessVerdict, setBusinessVerdict] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");

  const [currency, setCurrency] = useState("INR");
  const [calculationLocked, setCalculationLocked] =
    useState(false);

useEffect(() => {
  if (open) {
    loadMovies();

    if (initialMovieId) {
      setMovieId(String(initialMovieId));
    }
  }
}, [open, initialMovieId]);

  async function loadMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title")
      .order("title");

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      setMovies(data);
    }
  }

  function numberOrNull(value: string) {
    return value.trim() === "" ? null : Number(value);
  }

  async function handleSave() {
    if (!movieId) {
      alert("Please select a movie.");
      return;
    }

    const { data: existingBusiness } = await supabase
      .from("movie_business")
      .select("id")
      .eq("movie_id", Number(movieId))
      .maybeSingle();

    if (existingBusiness) {
      alert(
        "Business information already exists for this movie. Please use Edit instead."
      );
      return;
    }

    const { error } = await supabase
      .from("movie_business")
      .insert({
        movie_id: Number(movieId),

        production_budget_official:
          numberOrNull(productionBudgetOfficial),

        production_budget_trade:
          numberOrNull(productionBudgetTrade),

        p_and_a_cost: numberOrNull(pAndACost),

        total_investment:
          numberOrNull(totalInvestment),

        worldwide_rights_official:
          numberOrNull(worldwideRightsOfficial),

        worldwide_rights_trade:
          numberOrNull(worldwideRightsTrade),

        ott_rights: numberOrNull(ottRights),
        satellite_rights: numberOrNull(satelliteRights),
        digital_rights: numberOrNull(digitalRights),
        music_rights: numberOrNull(musicRights),
        remake_rights: numberOrNull(remakeRights),
        audio_rights: numberOrNull(audioRights),
        airline_rights: numberOrNull(airlineRights),
        in_flight_rights: numberOrNull(inFlightRights),
        other_rights: numberOrNull(otherRights),

        total_theatrical_share:
          numberOrNull(totalTheatricalShare),

        total_non_theatrical:
          numberOrNull(totalNonTheatrical),

        overall_recovery:
          numberOrNull(overallRecovery),

        producer_profit_loss:
          numberOrNull(producerProfitLoss),

        recovery_percentage:
          numberOrNull(recoveryPercentage),

       theatrical_verdict:
  theatricalVerdict.trim() || null,

business_verdict:
  businessVerdict.trim() || null,
        confidence_level:
          confidenceLevel.trim() || null,

        source:
          source.trim() || null,

        notes:
          notes.trim() || null,

        currency: currency.trim() || "INR",

        calculation_locked:
          calculationLocked,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Movie business information added successfully!");

    resetForm();

    onSaved?.();
    onClose();
  }

  function resetForm() {
    setMovieId("");

    setProductionBudgetOfficial("");
    setProductionBudgetTrade("");
    setPAndACost("");
    setTotalInvestment("");

    setWorldwideRightsOfficial("");
    setWorldwideRightsTrade("");

    setOttRights("");
    setSatelliteRights("");
    setDigitalRights("");
    setMusicRights("");
    setRemakeRights("");
    setAudioRights("");
    setAirlineRights("");
    setInFlightRights("");
    setOtherRights("");

    setTotalTheatricalShare("");
    setTotalNonTheatrical("");
    setOverallRecovery("");
    setProducerProfitLoss("");
    setRecoveryPercentage("");

    setTheatricalVerdict("");
    setBusinessVerdict("");
    setConfidenceLevel("");
    setSource("");
    setNotes("");

    setCurrency("INR");
    setCalculationLocked(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <h2 className="text-2xl font-bold text-white">
          Add Movie Business
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Add financial and business information for a movie.
        </p>

        {/* MOVIE */}

        <div className="mt-6">
          <label className="mb-2 block text-sm text-zinc-300">
            Movie *
          </label>

          <select
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
          >
            <option value="">Select Movie</option>

            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCTION */}

        <h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
          Production Investment
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <NumberField
            label="Production Budget — Official"
            value={productionBudgetOfficial}
            setValue={setProductionBudgetOfficial}
          />

          <NumberField
            label="Production Budget — JMI Trade"
            value={productionBudgetTrade}
            setValue={setProductionBudgetTrade}
          />

          <NumberField
            label="P&A Cost"
            value={pAndACost}
            setValue={setPAndACost}
          />

          <NumberField
            label="Total Investment"
            value={totalInvestment}
            setValue={setTotalInvestment}
          />

        </div>

        {/* WORLDWIDE RIGHTS */}

        <h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
          Worldwide Theatrical Rights
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <NumberField
            label="Worldwide Rights — Official"
            value={worldwideRightsOfficial}
            setValue={setWorldwideRightsOfficial}
          />

          <NumberField
            label="Worldwide Rights — JMI Trade"
            value={worldwideRightsTrade}
            setValue={setWorldwideRightsTrade}
          />

        </div>

        {/* NON THEATRICAL */}

        <h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
          Non-Theatrical Rights
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <NumberField label="OTT Rights" value={ottRights} setValue={setOttRights} />
          <NumberField label="Satellite Rights" value={satelliteRights} setValue={setSatelliteRights} />
          <NumberField label="Digital Rights" value={digitalRights} setValue={setDigitalRights} />
          <NumberField label="Music Rights" value={musicRights} setValue={setMusicRights} />
          <NumberField label="Remake Rights" value={remakeRights} setValue={setRemakeRights} />
          <NumberField label="Audio Rights" value={audioRights} setValue={setAudioRights} />
          <NumberField label="Airline Rights" value={airlineRights} setValue={setAirlineRights} />
          <NumberField label="In-Flight Rights" value={inFlightRights} setValue={setInFlightRights} />
          <NumberField label="Other Rights" value={otherRights} setValue={setOtherRights} />

        </div>

        {/* RECOVERY */}

        <h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
          Producer Recovery
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">

          <NumberField
            label="Total Theatrical Share"
            value={totalTheatricalShare}
            setValue={setTotalTheatricalShare}
          />

          <NumberField
            label="Total Non-Theatrical Recovery"
            value={totalNonTheatrical}
            setValue={setTotalNonTheatrical}
          />

          <NumberField
            label="Overall Recovery"
            value={overallRecovery}
            setValue={setOverallRecovery}
          />

          <NumberField
            label="Producer Profit / Loss"
            value={producerProfitLoss}
            setValue={setProducerProfitLoss}
          />

          <NumberField
            label="Recovery Percentage"
            value={recoveryPercentage}
            setValue={setRecoveryPercentage}
          />

        </div>

        {/* VERDICT */}

<h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
  Business Intelligence
</h3>

<div className="mt-4 space-y-4">

  {/* THEATRICAL VERDICT */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Theatrical Verdict
    </label>

    <select
      value={theatricalVerdict}
      onChange={(e) =>
        setTheatricalVerdict(e.target.value)
      }
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    >
      <option value="">
        Select Theatrical Verdict
      </option>

      <option>Blockbuster</option>
      <option>Super Hit</option>
      <option>Hit</option>
      <option>Average</option>
      <option>Below Average</option>
      <option>Flop</option>
      <option>Disaster</option>
      <option>Break Even</option>
      <option>Under Evaluation</option>
    </select>
  </div>

  {/* BUSINESS VERDICT */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Business Verdict
    </label>

    <select
      value={businessVerdict}
      onChange={(e) =>
        setBusinessVerdict(e.target.value)
      }
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    >
      <option value="">
        Select Business Verdict
      </option>

      <option>Blockbuster</option>
      <option>Super Hit</option>
      <option>Hit</option>
      <option>Average</option>
      <option>Below Average</option>
      <option>Flop</option>
      <option>Disaster</option>
      <option>Break Even</option>
      <option>Profit</option>
      <option>Loss</option>
      <option>Under Evaluation</option>
    </select>
  </div>

  {/* CONFIDENCE */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Confidence Level
    </label>

    <select
      value={confidenceLevel}
      onChange={(e) =>
        setConfidenceLevel(e.target.value)
      }
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    >
      <option value="">
        Select Confidence
      </option>

      <option>Official</option>
      <option>Verified</option>
      <option>High</option>
      <option>Medium</option>
      <option>Low</option>
      <option>Estimated</option>
    </select>
  </div>

  {/* SOURCE */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Source
    </label>

    <input
      value={source}
      onChange={(e) =>
        setSource(e.target.value)
      }
      placeholder="Producer announcement / Trade source / Distributor"
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    />
  </div>

  {/* NOTES */}

  <div>
    <label className="mb-2 block text-sm text-zinc-300">
      Notes
    </label>

    <textarea
      value={notes}
      onChange={(e) =>
        setNotes(e.target.value)
      }
      rows={4}
      placeholder="Additional business information..."
      className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
    />
  </div>

</div>

        {/* CURRENCY */}

        <h3 className="mt-8 border-b border-zinc-700 pb-2 text-lg font-semibold text-yellow-400">
          Settings
        </h3>

        <div className="mt-4 flex items-center gap-4">

          <div className="flex-1">
            <label className="mb-2 block text-sm text-zinc-300">
              Currency
            </label>

            <input
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value.toUpperCase())
              }
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
            />
          </div>

          <label className="mt-7 flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={calculationLocked}
              onChange={(e) =>
                setCalculationLocked(e.target.checked)
              }
            />
            Lock calculations
          </label>

        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-black"
          >
            Save Business Data
          </button>

        </div>

      </div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: string;
  setValue: (value: string) => void;
};

function NumberField({
  label,
  value,
  setValue,
}: NumberFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>

      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
      />
    </div>
  );
}