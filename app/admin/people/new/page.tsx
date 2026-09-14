import PersonForm from "@/components/people/PersonForm";

export default function NewPersonPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Add Person
        </h1>

        <p className="text-zinc-400">
          Create a new person profile.
        </p>
      </div>

      <PersonForm />
    </div>
  );
}