type StatCardProps = {
  title: string;
  value: number | string;
};

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-xl bg-zinc-900 p-6">

      <h2 className="text-zinc-400">
        {title}
      </h2>

      <p className="mt-3 text-4xl font-bold text-yellow-400">
        {value}
      </p>

    </div>
  );
}