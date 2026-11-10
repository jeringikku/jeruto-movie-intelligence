import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PersonForm from "../../PersonForm";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = Number(id);

  if (!Number.isInteger(personId) || personId <= 0) {
    notFound();
  }

  const { data: person, error } = await supabase
    .from("people")
    .select(
      "id, full_name, slug, gender, profile_image_url"
    )
    .eq("id", personId)
    .maybeSingle();

  if (error) {
    console.error("Person loading error:", error);
    throw new Error("Unable to load this person's details.");
  }

  if (!person) {
    notFound();
  }

  return <PersonForm initialPerson={person} />;
}