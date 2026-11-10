"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PersonRecord = {
  id: number;
  full_name: string;
  slug: string;
  gender: string | null;
  profile_image_url: string | null;
};

export default function PersonForm({
  initialPerson = null,
}: {
  initialPerson?: PersonRecord | null;
}) {
  const router = useRouter();

  const isEditing = Boolean(initialPerson);

  const [fullName, setFullName] = useState(
    initialPerson?.full_name ?? ""
  );

  const [slug, setSlug] = useState(
    initialPerson?.slug ?? ""
  );

  const [gender, setGender] = useState(
    initialPerson?.gender ?? ""
  );

  const [profileImageUrl, setProfileImageUrl] = useState(
    initialPerson?.profile_image_url ?? ""
  );

  const [saving, setSaving] = useState(false);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");
  }

  async function handleSave() {
    if (!fullName.trim()) {
      alert("Please enter a full name.");
      return;
    }

    const finalSlug = slug.trim() || createSlug(fullName);

    if (!finalSlug) {
      alert("Unable to generate a valid slug.");
      return;
    }

    const imageUrl = profileImageUrl.trim();

    if (imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (
          parsedUrl.protocol !== "https:" &&
          parsedUrl.protocol !== "http:"
        ) {
          throw new Error("Invalid image URL protocol");
        }
      } catch {
        alert("Please enter a valid HTTP or HTTPS profile picture URL.");
        return;
      }
    }

    setSaving(true);

    const personData = {
      full_name: fullName.trim(),
      slug: finalSlug,
      gender: gender || null,
      profile_image_url: imageUrl || null,
    };

    try {
      if (isEditing && initialPerson) {
        const { data, error } = await supabase
          .from("people")
          .update({
            ...personData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialPerson.id)
          .select("id");

        if (error) {
          alert(error.message);
          return;
        }

        if (!data || data.length === 0) {
          alert(
            "The person was not updated. Please check your Supabase UPDATE permissions."
          );
          return;
        }

        alert("Person updated successfully!");
      } else {
        const { error } = await supabase
          .from("people")
          .insert(personData);

        if (error) {
          alert(error.message);
          return;
        }

        alert("Person added successfully!");
      }

      router.push("/admin/people");
      router.refresh();
    } catch (error) {
      console.error("Person save error:", error);
      alert("An unexpected error occurred while saving the person.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? "Edit Person" : "Add New Person"}
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          {isEditing
            ? "Update the person's information and profile picture."
            : "Enter the details of the new film personality."}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 sm:p-6">
        <div className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Full Name *
            </label>

            <input
              value={fullName}
              onChange={(e) => {
                const value = e.target.value;
                setFullName(value);
                setSlug(createSlug(value));
              }}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Slug
            </label>

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="person-name"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Automatically generated from the name. You can edit it if necessary.
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Gender
            </label>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Profile Image URL */}
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Profile Picture URL
            </label>

            <input
              type="url"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="https://example.com/person-image.jpg"
            />

            <p className="mt-1 text-xs text-zinc-500">
              Paste a publicly accessible image URL. This field is optional.
              The image will automatically synchronize with the person's role profiles.
            </p>

            {profileImageUrl.trim() && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-zinc-400">
                  Profile Picture Preview
                </p>

                <img
                  src={profileImageUrl}
                  alt="Profile preview"
                  className="h-28 w-28 rounded-xl border border-zinc-700 bg-black object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  onLoad={(e) => {
                    e.currentTarget.style.display = "block";
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Update Person"
                  : "Save Person"}
            </button>

            <Link
              href="/admin/people"
              className="rounded-lg border border-zinc-700 px-6 py-3 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}