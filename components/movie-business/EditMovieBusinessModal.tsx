"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  movie?: {
    title: string;
  } | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  business: MovieBusiness | null;
  onSaved: () => void;
};

function EditMovieBusinessModal({
  open,
  onClose,
  business,
  onSaved,
}: Props) {

  const [productionBudgetOfficial, setProductionBudgetOfficial] =
    useState("");

  const [productionBudgetTrade, setProductionBudgetTrade] =
    useState("");

  const [pAndACost, setPAndACost] = useState("");

  const [totalInvestment, setTotalInvestment] =
    useState("");

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

  const [overallRecovery, setOverallRecovery] =
    useState("");

  const [producerProfitLoss, setProducerProfitLoss] =
    useState("");

  const [recoveryPercentage, setRecoveryPercentage] =
    useState("");
const [theatricalVerdict, setTheatricalVerdict] =
  useState("");

const [businessVerdict, setBusinessVerdict] =
  useState("");

  const [confidenceLevel, setConfidenceLevel] =
    useState("");

  const [source, setSource] = useState("");

  const [notes, setNotes] = useState("");

  const [currency, setCurrency] = useState("₹");

  const [calculationLocked, setCalculationLocked] =
    useState(false);

  useEffect(() => {
    if (!business) return;

    setProductionBudgetOfficial(
      business.production_budget_official?.toString() ?? ""
    );

    setProductionBudgetTrade(
      business.production_budget_trade?.toString() ?? ""
    );

    setPAndACost(
      business.p_and_a_cost?.toString() ?? ""
    );

    setTotalInvestment(
      business.total_investment?.toString() ?? ""
    );

    setWorldwideRightsOfficial(
      business.worldwide_rights_official?.toString() ?? ""
    );

    setWorldwideRightsTrade(
      business.worldwide_rights_trade?.toString() ?? ""
    );

    setOttRights(
      business.ott_rights?.toString() ?? ""
    );

    setSatelliteRights(
      business.satellite_rights?.toString() ?? ""
    );

    setDigitalRights(
      business.digital_rights?.toString() ?? ""
    );

    setMusicRights(
      business.music_rights?.toString() ?? ""
    );

    setRemakeRights(
      business.remake_rights?.toString() ?? ""
    );

    setAudioRights(
      business.audio_rights?.toString() ?? ""
    );

    setAirlineRights(
      business.airline_rights?.toString() ?? ""
    );

    setInFlightRights(
      business.in_flight_rights?.toString() ?? ""
    );

    setOtherRights(
      business.other_rights?.toString() ?? ""
    );

    setTotalTheatricalShare(
      business.total_theatrical_share?.toString() ?? ""
    );

    setTotalNonTheatrical(
      business.total_non_theatrical?.toString() ?? ""
    );

    setOverallRecovery(
      business.overall_recovery?.toString() ?? ""
    );

    setProducerProfitLoss(
      business.producer_profit_loss?.toString() ?? ""
    );

    setRecoveryPercentage(
      business.recovery_percentage?.toString() ?? ""
    );

  setTheatricalVerdict(
  business.theatrical_verdict ?? ""
);

setBusinessVerdict(
  business.business_verdict ?? ""
);

    setConfidenceLevel(
      business.confidence_level ?? ""
    );

    setSource(
      business.source ?? ""
    );

    setNotes(
      business.notes ?? ""
    );

    setCurrency(
      business.currency ?? "₹"
    );

    setCalculationLocked(
      business.calculation_locked ?? false
    );

  }, [business]);

  function numberOrNull(value: string) {
    if (value.trim() === "") {
      return null;
    }

    const number = Number(value);

    return Number.isNaN(number) ? null : number;
  }

  async function handleSave() {

    if (!business) return;

    const { error } = await supabase
      .from("movie_business")
      .update({

        production_budget_official:
          numberOrNull(productionBudgetOfficial),

        production_budget_trade:
          numberOrNull(productionBudgetTrade),

        p_and_a_cost:
          numberOrNull(pAndACost),

        total_investment:
          numberOrNull(totalInvestment),

        worldwide_rights_official:
          numberOrNull(worldwideRightsOfficial),

        worldwide_rights_trade:
          numberOrNull(worldwideRightsTrade),

        ott_rights:
          numberOrNull(ottRights),

        satellite_rights:
          numberOrNull(satelliteRights),

        digital_rights:
          numberOrNull(digitalRights),

        music_rights:
          numberOrNull(musicRights),

        remake_rights:
          numberOrNull(remakeRights),

        audio_rights:
          numberOrNull(audioRights),

        airline_rights:
          numberOrNull(airlineRights),

        in_flight_rights:
          numberOrNull(inFlightRights),

        other_rights:
          numberOrNull(otherRights),

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

        currency:
          currency.trim() || "₹",

        calculation_locked:
          calculationLocked,

      })
      .eq("id", business.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Movie business data updated successfully!");

    onSaved();
  }

  if (!open || !business) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-white">
            Edit Movie Business
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            {business.movie?.title ?? "Movie"}
          </p>

        </div>

        {/* INVESTMENT */}

        <div className="mb-8">

          <h3 className="mb-4 text-lg font-semibold text-yellow-400">
            Investment
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Official Production Budget"
              value={productionBudgetOfficial}
              onChange={setProductionBudgetOfficial}
            />

            <Field
              label="Trade Production Budget"
              value={productionBudgetTrade}
              onChange={setProductionBudgetTrade}
            />

            <Field
              label="P&A Cost"
              value={pAndACost}
              onChange={setPAndACost}
            />

            <Field
              label="Total Investment"
              value={totalInvestment}
              onChange={setTotalInvestment}
            />

          </div>

        </div>

        {/* WORLDWIDE RIGHTS */}

        <div className="mb-8">

          <h3 className="mb-4 text-lg font-semibold text-yellow-400">
            Worldwide Theatrical Rights
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Official Worldwide Rights"
              value={worldwideRightsOfficial}
              onChange={setWorldwideRightsOfficial}
            />

            <Field
              label="Trade Worldwide Rights"
              value={worldwideRightsTrade}
              onChange={setWorldwideRightsTrade}
            />

          </div>

        </div>

        {/* NON THEATRICAL */}

        <div className="mb-8">

          <h3 className="mb-4 text-lg font-semibold text-yellow-400">
            Non-Theatrical Rights
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="OTT Rights"
              value={ottRights}
              onChange={setOttRights}
            />

            <Field
              label="Satellite Rights"
              value={satelliteRights}
              onChange={setSatelliteRights}
            />

            <Field
              label="Digital Rights"
              value={digitalRights}
              onChange={setDigitalRights}
            />

            <Field
              label="Music Rights"
              value={musicRights}
              onChange={setMusicRights}
            />

            <Field
              label="Remake Rights"
              value={remakeRights}
              onChange={setRemakeRights}
            />

            <Field
              label="Audio Rights"
              value={audioRights}
              onChange={setAudioRights}
            />

            <Field
              label="Airline Rights"
              value={airlineRights}
              onChange={setAirlineRights}
            />

            <Field
              label="In-Flight Rights"
              value={inFlightRights}
              onChange={setInFlightRights}
            />

            <Field
              label="Other Rights"
              value={otherRights}
              onChange={setOtherRights}
            />

          </div>

        </div>

        {/* RECOVERY */}

        <div className="mb-8">

          <h3 className="mb-4 text-lg font-semibold text-yellow-400">
            Recovery & Profitability
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            <Field
              label="Total Theatrical Share"
              value={totalTheatricalShare}
              onChange={setTotalTheatricalShare}
            />

            <Field
              label="Total Non-Theatrical Recovery"
              value={totalNonTheatrical}
              onChange={setTotalNonTheatrical}
            />

            <Field
              label="Overall Recovery"
              value={overallRecovery}
              onChange={setOverallRecovery}
            />

            <Field
              label="Producer Profit / Loss"
              value={producerProfitLoss}
              onChange={setProducerProfitLoss}
            />

            <Field
              label="Recovery Percentage"
              value={recoveryPercentage}
              onChange={setRecoveryPercentage}
            />

          </div>

        </div>

        {/* ANALYSIS */}

        <div className="mb-8">

          <h3 className="mb-4 text-lg font-semibold text-yellow-400">
            Business Analysis
          </h3>

          <div className="grid gap-4 md:grid-cols-2">

            <div>

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

    <option value="Blockbuster">
      Blockbuster
    </option>

    <option value="Super Hit">
      Super Hit
    </option>

    <option value="Hit">
      Hit
    </option>

    <option value="Average">
      Average
    </option>

    <option value="Below Average">
      Below Average
    </option>

    <option value="Flop">
      Flop
    </option>

    <option value="Disaster">
      Disaster
    </option>

    <option value="Break Even">
      Break Even
    </option>

    <option value="Under Evaluation">
      Under Evaluation
    </option>

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

    <option value="Blockbuster">
      Blockbuster
    </option>

    <option value="Super Hit">
      Super Hit
    </option>

    <option value="Hit">
      Hit
    </option>

    <option value="Average">
      Average
    </option>

    <option value="Below Average">
      Below Average
    </option>

    <option value="Flop">
      Flop
    </option>

    <option value="Disaster">
      Disaster
    </option>

    <option value="Break Even">
      Break Even
    </option>

    <option value="Profit">
      Profit
    </option>

    <option value="Loss">
      Loss
    </option>

    <option value="Under Evaluation">
      Under Evaluation
    </option>

  </select>

</div>
              <select
                value={businessVerdict}
                onChange={(e) =>
                  setBusinessVerdict(e.target.value)
                }
                className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              >

                <option value="">
                  Select Verdict
                </option>

                <option value="Blockbuster">
                  Blockbuster
                </option>

                <option value="Super Hit">
                  Super Hit
                </option>

                <option value="Hit">
                  Hit
                </option>

                <option value="Average">
                  Average
                </option>

                <option value="Below Average">
                  Below Average
                </option>

                <option value="Flop">
                  Flop
                </option>

                <option value="Disaster">
                  Disaster
                </option>

                <option value="Unclear">
                  Unclear
                </option>

              </select>

            </div>

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

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>

              </select>

            </div>

          </div>

          <div className="mt-4">

            <label className="mb-2 block text-sm text-zinc-300">
              Source
            </label>

            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              placeholder="Producer announcement / Trade source / Distributor"
            />

          </div>

          <div className="mt-4">

            <label className="mb-2 block text-sm text-zinc-300">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
              placeholder="Additional business notes..."
            />

          </div>

        </div>

        {/* SETTINGS */}

        <div className="mb-8 rounded-lg border border-zinc-700 p-4">

          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={calculationLocked}
              onChange={(e) =>
                setCalculationLocked(e.target.checked)
              }
              className="h-4 w-4"
            />

            <div>

              <p className="font-semibold text-white">
                Lock Calculations
              </p>

              <p className="text-sm text-zinc-400">
                Prevent accidental changes to finalized business calculations.
              </p>

            </div>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-5 py-2 text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-yellow-500 px-5 py-2 font-semibold text-black"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-300">
        {label}
      </label>

      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white"
        placeholder="0"
      />

    </div>
  );
}

export { EditMovieBusinessModal };