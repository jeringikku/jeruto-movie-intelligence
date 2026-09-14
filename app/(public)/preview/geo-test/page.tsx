import IndiaGeographicalMap from "../../components/IndiaGeographicalMap";

export default function GeoTestPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
            JMI Intelligence
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Geographical Breakdown
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            India state boundary map — development preview.
          </p>
        </div>

        <IndiaGeographicalMap />
      </div>
    </main>
  );
}