"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import PublicHeader from "@/app/(public)/components/PublicHeader";

/* ============================================================
   JMI PROFILE AVATARS

   Human-style illustrated profile portraits.
   Different age groups, genders and appearances.
   ============================================================ */

const avatarOptions = [
  {
    id: "young-man-01",
    label: "Young Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-man-01&backgroundColor=1f2937",
  },
  {
    id: "young-woman-01",
    label: "Young Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-woman-01&backgroundColor=312e81",
  },
  {
    id: "young-man-02",
    label: "Young Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-man-02&backgroundColor=334155",
  },
  {
    id: "young-woman-02",
    label: "Young Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-woman-02&backgroundColor=4c1d95",
  },

  {
    id: "adult-man-01",
    label: "Adult Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-man-01&backgroundColor=1e293b",
  },
  {
    id: "adult-woman-01",
    label: "Adult Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-woman-01&backgroundColor=3b0764",
  },
  {
    id: "adult-man-02",
    label: "Adult Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-man-02&backgroundColor=172554",
  },
  {
    id: "adult-woman-02",
    label: "Adult Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-woman-02&backgroundColor=422006",
  },

  {
    id: "young-man-03",
    label: "Young Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-man-03&backgroundColor=0f172a",
  },
  {
    id: "young-woman-03",
    label: "Young Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-woman-03&backgroundColor=581c87",
  },
  {
    id: "adult-man-03",
    label: "Adult Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-man-03&backgroundColor=1c1917",
  },
  {
    id: "adult-woman-03",
    label: "Adult Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-woman-03&backgroundColor=172554",
  },

  {
    id: "mature-man-01",
    label: "Mature Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-man-01&backgroundColor=292524",
  },
  {
    id: "mature-woman-01",
    label: "Mature Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-woman-01&backgroundColor=3f3f46",
  },
  {
    id: "mature-man-02",
    label: "Mature Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-man-02&backgroundColor=1e293b",
  },
  {
    id: "mature-woman-02",
    label: "Mature Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-woman-02&backgroundColor=4c1d95",
  },

  {
    id: "adult-man-04",
    label: "Adult Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-man-04&backgroundColor=0c4a6e",
  },
  {
    id: "adult-woman-04",
    label: "Adult Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-woman-04&backgroundColor=701a75",
  },
  {
    id: "young-man-04",
    label: "Young Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-man-04&backgroundColor=1e1b4b",
  },
  {
    id: "young-woman-04",
    label: "Young Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=young-woman-04&backgroundColor=3f3f46",
  },

  {
    id: "mature-man-03",
    label: "Mature Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-man-03&backgroundColor=18181b",
  },
  {
    id: "mature-woman-03",
    label: "Mature Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=mature-woman-03&backgroundColor=312e81",
  },
  {
    id: "adult-man-05",
    label: "Adult Man",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-man-05&backgroundColor=111827",
  },
  {
    id: "adult-woman-05",
    label: "Adult Woman",
    url: "https://api.dicebear.com/10.x/personas/svg?seed=adult-woman-05&backgroundColor=4a044e",
  },
];

/* ============================================================
   INDIAN STATES + UNION TERRITORIES
   ============================================================ */

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

/* ============================================================
   COUNTRIES
   ============================================================ */

const countries = [
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "New Zealand",
  "Singapore",
  "Malaysia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "South Africa",
  "Sri Lanka",
  "Nepal",
  "Bangladesh",
  "Pakistan",
  "Japan",
  "South Korea",
  "Other",
];

/* ============================================================
   TYPES
   ============================================================ */

type UserInfo = {
  id: string;
  email: string;
  createdAt: string;
};

type ProfileInfo = {
  fullName: string;
  age: number | null;
  gender: string;
  state: string;
  country: string;
  avatarId: string;
  avatarUrl: string;
};

type SubscriptionInfo = {
  planName: string;
  planSlug: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const emptyProfile: ProfileInfo = {
  fullName: "",
  age: null,
  gender: "",
  state: "",
  country: "",
  avatarId: "",
  avatarUrl: "",
};

/* ============================================================
   ACCOUNT PAGE
   ============================================================ */

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserInfo | null>(null);

  const [profile, setProfile] =
    useState<ProfileInfo>(emptyProfile);

  const [editProfile, setEditProfile] =
    useState<ProfileInfo>(emptyProfile);

  const [subscription, setSubscription] =
    useState<SubscriptionInfo | null>(null);

  const [showAvatars, setShowAvatars] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  /* ==========================================================
     LOAD ACCOUNT
     ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      setLoading(true);

      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        router.replace("/account/login");
        return;
      }

      if (!mounted) return;

      setUser({
        id: user.id,
        email: user.email || "",
        createdAt: user.created_at,
      });

      /* --------------------------------------------------------
         Load profile
         -------------------------------------------------------- */

      const {
        data: profileData,
        error: profileError,
      } = await supabaseBrowser
        .from("profiles")
        .select(
          `
            full_name,
            age,
            gender,
            state,
            country,
            avatar_id,
            avatar_url
          `
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Profile loading error:",
          profileError
        );
      }

      const loadedProfile: ProfileInfo = {
        fullName:
          profileData?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "JMI User",

        age:
          typeof profileData?.age === "number"
            ? profileData.age
            : null,

        gender:
          profileData?.gender || "",

        state:
          profileData?.state || "",

        country:
          profileData?.country || "",

        avatarId:
          profileData?.avatar_id || "",

        avatarUrl:
          profileData?.avatar_url || "",
      };

      if (!mounted) return;

      setProfile(loadedProfile);
      setEditProfile(loadedProfile);

      /* --------------------------------------------------------
         Load subscription
         -------------------------------------------------------- */

      const {
        data: subscriptionData,
        error: subscriptionError,
      } = await supabaseBrowser
        .from("user_subscriptions")
        .select(
          `
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            subscription_plans (
              name,
              slug
            )
          `
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (subscriptionError) {
        console.error(
          "Subscription loading error:",
          subscriptionError
        );
      }

      if (
        subscriptionData &&
        mounted
      ) {
        const plan =
          Array.isArray(
            subscriptionData.subscription_plans
          )
            ? subscriptionData.subscription_plans[0]
            : subscriptionData.subscription_plans;

        setSubscription({
          planName:
            plan?.name || "Free",

          planSlug:
            plan?.slug || "free",

          status:
            subscriptionData.status || "active",

          currentPeriodStart:
            subscriptionData.current_period_start ||
            null,

          currentPeriodEnd:
            subscriptionData.current_period_end ||
            null,

          cancelAtPeriodEnd:
            subscriptionData.cancel_at_period_end ||
            false,
        });
      }

      if (mounted) {
        setLoading(false);
      }
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ==========================================================
     PROFILE COMPLETION
     ========================================================== */

  const profileCompletion = useMemo(() => {
    const fields = [
      profile.fullName.trim(),

      profile.age !== null
        ? String(profile.age)
        : "",

      profile.gender,

      profile.state,

      profile.country,

      profile.avatarId,
    ];

    const completed =
      fields.filter(
        (value) => value !== ""
      ).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [profile]);

  /* ==========================================================
     SAVE PROFILE
     ========================================================== */

  async function handleSaveProfile() {
    if (!user) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    /* ==========================================================
       REFRESH SUPABASE SESSION
       ========================================================== */

    const {
      data: refreshedSession,
      error: refreshError,
    } = await supabaseBrowser.auth.refreshSession();

    if (refreshError || !refreshedSession.session) {
      console.error(
        "Session refresh error:",
        refreshError
      );

      setErrorMessage(
        "Your session has expired. Please log in again."
      );

      setSaving(false);

      return;
    }

    /* ==========================================================
       USE THE FRESH AUTH USER
       ========================================================== */

    const freshUser =
      refreshedSession.session.user;

    if (!freshUser) {
      setErrorMessage(
        "Your session has expired. Please log in again."
      );

      setSaving(false);

      return;
    }

    /* ==========================================================
       VALIDATE PROFILE
       ========================================================== */

    const trimmedName =
      editProfile.fullName.trim();

    if (!trimmedName) {
      setErrorMessage(
        "Please enter your full name."
      );

      setSaving(false);

      return;
    }

    if (
      editProfile.age !== null &&
      (
        !Number.isInteger(editProfile.age) ||
        editProfile.age < 13 ||
        editProfile.age > 120
      )
    ) {
      setErrorMessage(
        "Please enter a valid age between 13 and 120."
      );

      setSaving(false);

      return;
    }

    /* ==========================================================
       FIND SELECTED AVATAR
       ========================================================== */

    const avatar =
      avatarOptions.find(
        (item) =>
          item.id === editProfile.avatarId
      );

    const avatarUrl =
      avatar?.url ||
      editProfile.avatarUrl ||
      "";

    /* ==========================================================
       PROFILE PAYLOAD
       ========================================================== */

    const profilePayload = {
      user_id: freshUser.id,

      full_name:
        trimmedName,

      age:
        editProfile.age,

      gender:
        editProfile.gender || null,

      state:
        editProfile.state || null,

      country:
        editProfile.country || null,

      avatar_id:
        editProfile.avatarId || null,

      avatar_url:
        avatarUrl || null,
    };

    /* ==========================================================
       UPDATE EXISTING PROFILE
       ========================================================== */

    const {
      data: updatedProfile,
      error: updateError,
    } = await supabaseBrowser
      .from("profiles")
      .update(profilePayload)
      .eq("user_id", freshUser.id)
      .select()
      .maybeSingle();

    /* ==========================================================
       HANDLE EXPIRED SESSION / UPDATE ERROR
       ========================================================== */

    if (updateError) {
      console.error(
        "Profile update error:",
        updateError
      );

      if (
        updateError.code === "PGRST303" ||
        updateError.message
          ?.toLowerCase()
          .includes("jwt expired")
      ) {
        setErrorMessage(
          "Your session expired. Please log in again."
        );
      } else {
        setErrorMessage(
          "Unable to save your profile. Please try again."
        );
      }

      setSaving(false);

      return;
    }

    /* ==========================================================
       FALLBACK INSERT
       ========================================================== */

    if (!updatedProfile) {
      const {
        error: insertError,
      } = await supabaseBrowser
        .from("profiles")
        .insert(profilePayload);

      if (insertError) {
        console.error(
          "Profile insert error:",
          insertError
        );

        if (
          insertError.code === "PGRST303" ||
          insertError.message
            ?.toLowerCase()
            .includes("jwt expired")
        ) {
          setErrorMessage(
            "Your session expired. Please log in again."
          );
        } else {
          setErrorMessage(
            "Unable to create your profile. Please try again."
          );
        }

        setSaving(false);

        return;
      }
    }

    /* ==========================================================
       UPDATE LOCAL PROFILE STATE
       ========================================================== */

    const savedProfile: ProfileInfo = {
      fullName:
        trimmedName,

      age:
        editProfile.age,

      gender:
        editProfile.gender,

      state:
        editProfile.state,

      country:
        editProfile.country,

      avatarId:
        editProfile.avatarId,

      avatarUrl,
    };

    setProfile(savedProfile);

    setEditProfile(savedProfile);

    setEditing(false);

    setShowAvatars(false);

    setMessage(
      "Profile updated successfully."
    );

    setSaving(false);
  }

  /* ==========================================================
     CANCEL PROFILE EDITING
     ========================================================== */

  function handleCancelEdit() {
    setEditProfile(profile);
    setEditing(false);
    setShowAvatars(false);
    setMessage("");
    setErrorMessage("");
  }

  /* ==========================================================
     AVATAR SELECT
     ========================================================== */

  function handleAvatarSelect(
    avatarId: string,
    avatarUrl: string
  ) {
    setEditProfile((current) => ({
      ...current,
      avatarId,
      avatarUrl,
    }));

    setShowAvatars(false);
  }

  /* ==========================================================
     LOGOUT
     ========================================================== */

  async function handleLogout() {
    setLoggingOut(true);

    const { error } =
      await supabaseBrowser.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  /* ==========================================================
     DATE
     ========================================================== */

  function formatDate(
    dateString: string | null
  ) {
    if (!dateString) return "—";

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* ==========================================================
     STATUS
     ========================================================== */

  function formatStatus(
    status: string
  ) {
    return status
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  }

  /* ==========================================================
     DISPLAY AVATARS
     ========================================================== */

  const displayAvatar =
    profile.avatarUrl ||
    avatarOptions[0].url;

  const editingAvatar =
    editProfile.avatarUrl ||
    avatarOptions[0].url;

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <>
        <PublicHeader />

        <main className="min-h-screen bg-[#050507] px-4 pb-20 pt-28 text-zinc-100">

          <div className="mx-auto max-w-4xl">

            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center shadow-2xl">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

              <p className="text-sm text-zinc-500">
                Loading your JMI account...
              </p>

            </div>

          </div>

        </main>
      </>
    );
  }

  if (!user) {
    return null;
  }

  const planName =
    subscription?.planName ||
    "Free";

  const subscriptionStatus =
    subscription?.status ||
    "active";

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#050507] px-4 pb-20 pt-24 text-zinc-100 sm:px-6">

        <div className="mx-auto max-w-4xl">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-1">

            {/* ==================================================
                BACK TO JMI HOME
            ================================================== */}

            <div className="mb-6">

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[9px] text-violet-400 transition hover:text-zinc-300"
              >
                <span>←</span>

                <span>
                  Back to JMI Home
                </span>

              </Link>

            </div>

            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1">

              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                JMI Membership Profile
              </span>

            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-yellow-500 sm:text-3xl">
              My Account
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-400">
              Manage your JMI profile, subscription and
              entertainment activity from one place.
            </p>

          </div>

          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <section className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.10] via-white/[0.025] to-transparent p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-6">

            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {/* Avatar */}

                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setShowAvatars(true);
                  }}
                  className="group relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-full border-2 border-violet-300/30 bg-zinc-900 shadow-[0_0_0_3px_rgba(139,92,246,0.08),0_12px_40px_rgba(0,0,0,0.5)] transition duration-300 hover:scale-[1.03] hover:border-violet-300/60"
                >

                  <img
                    src={displayAvatar}
                    alt="JMI profile avatar"
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-transparent to-transparent pb-1 opacity-0 transition group-hover:opacity-100">

                    <span className="text-[8px] font-medium uppercase tracking-wider text-white">
                      Change
                    </span>

                  </span>

                </button>

                <div>

                  <p className="text-lg font-semibold tracking-tight text-white">
                    {profile.fullName ||
                      "JMI User"}
                  </p>

                  <p className="mt-0.5 break-all text-[11px] text-zinc-500">
                    {user.email}
                  </p>

                  <p className="mt-1.5 text-[10px] text-zinc-600">
                    Member since{" "}
                    {formatDate(
                      user.createdAt
                    )}
                  </p>

                </div>

              </div>

              {/* Completion */}

              <div className="min-w-[180px] rounded-2xl border border-white/[0.07] bg-black/20 p-3.5 backdrop-blur-xl">

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[10px] font-medium text-zinc-400">
                    Profile completion
                  </span>

                  <span className="text-xs font-semibold text-violet-300">
                    {profileCompletion}%
                  </span>

                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-400 to-fuchsia-300 shadow-[0_0_12px_rgba(167,139,250,0.55)] transition-all duration-700"
                    style={{
                      width: `${profileCompletion}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-[9px] text-zinc-400">
                  Complete your profile for a better JMI experience.
                </p>

              </div>

            </div>

          </section>

          {/* ==================================================
              SUCCESS / ERROR
          ================================================== */}

          {message && (
            <div className="mb-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] px-4 py-3 text-xs text-emerald-300">
              {message}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              PROFILE
          ================================================== */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-[0_15px_60px_rgba(0,0,0,0.25)]">

            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-sm font-semibold text-pink-500">
                  Profile
                </h2>

                <p className="mt-0.5 text-[10px] text-zinc-400">
                  Keep your JMI member information up to date.
                </p>

              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditProfile(profile);
                    setEditing(true);
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className="rounded-xl border border-violet-300/20 bg-gradient-to-b from-violet-400/20 to-violet-600/10 px-3.5 py-2 text-[10px] font-semibold text-violet-200 shadow-[0_4px_18px_rgba(124,58,237,0.15)] transition hover:border-violet-300/40 hover:from-violet-400/30 hover:to-violet-600/15 active:scale-[0.98]"
                >
                  Edit Profile
                </button>
              )}

            </div>

            <div className="p-5 sm:p-6">

              {!editing ? (
                <>
                  {/* Avatar row */}

                  <div className="mb-5 flex items-center gap-3">

                    <img
                      src={displayAvatar}
                      alt="Profile avatar"
                      className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    />

                    <div>

                      <p className="text-xs font-medium text-zinc-300">
                        Profile Avatar
                      </p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        Your selected JMI identity image.
                      </p>

                    </div>

                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">

                    <ProfileDisplay
                      label="Full Name"
                      value={
                        profile.fullName ||
                        "Not added"
                      }
                    />

                    <ProfileDisplay
                      label="Email"
                      value={user.email}
                    />

                    <ProfileDisplay
                      label="Age"
                      value={
                        profile.age !== null
                          ? `${profile.age} years`
                          : "Not added"
                      }
                    />

                    <ProfileDisplay
                      label="Gender"
                      value={
                        profile.gender ||
                        "Not added"
                      }
                    />

                    <ProfileDisplay
                      label="State"
                      value={
                        profile.state ||
                        "Not added"
                      }
                    />

                    <ProfileDisplay
                      label="Country"
                      value={
                        profile.country ||
                        "Not added"
                      }
                    />

                  </div>
                </>
              ) : (
                <>
                  {/* ==================================================
                      EDIT FORM
                  ================================================== */}

                  <div className="mb-6">

                    <div className="mb-3 flex items-center gap-3">

                      <img
                        src={editingAvatar}
                        alt="Selected avatar"
                        className="h-16 w-16 rounded-full border-2 border-violet-400/30 bg-zinc-900 object-cover shadow-[0_0_28px_rgba(139,92,246,0.20)]"
                      />

                      <div>

                        <p className="text-xs font-medium text-white">
                          Choose your avatar
                        </p>

                        <p className="mt-0.5 text-[10px] text-zinc-600">
                          Select a human-style JMI profile avatar.
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAvatars(
                          (value) => !value
                        )
                      }
                      className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-3.5 py-2 text-[10px] font-semibold text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/[0.06]"
                    >
                      {showAvatars
                        ? "Hide Avatars"
                        : "Choose Avatar"}
                    </button>

                    {showAvatars && (
                      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/30 p-3.5">

                        <div className="mb-3 flex items-center justify-between">

                          <div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                              Choose Avatar
                            </p>

                            <p className="mt-0.5 text-[9px] text-zinc-700">
                              Human profile characters
                            </p>

                          </div>

                          <span className="text-[9px] text-zinc-700">
                            24 avatars
                          </span>

                        </div>

                        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">

                          {avatarOptions.map(
                            (avatar) => (
                              <button
                                key={avatar.id}
                                type="button"
                                onClick={() =>
                                  handleAvatarSelect(
                                    avatar.id,
                                    avatar.url
                                  )
                                }
                                title={avatar.label}
                                className={`group relative aspect-square overflow-hidden rounded-full border-2 transition duration-200 ${
                                  editProfile.avatarId ===
                                  avatar.id
                                    ? "border-violet-400 ring-2 ring-violet-400/20 shadow-[0_0_18px_rgba(139,92,246,0.28)]"
                                    : "border-white/[0.08] hover:border-violet-300/40"
                                }`}
                              >

                                <img
                                  src={
                                    avatar.url
                                  }
                                  alt={
                                    avatar.label
                                  }
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />

                                {editProfile.avatarId ===
                                  avatar.id && (
                                  <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-violet-500 text-[10px] font-bold text-white shadow-lg">
                                    ✓
                                  </span>
                                )}

                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>

                  {/* ==================================================
                      PROFILE FORM
                  ================================================== */}

                  <div className="grid gap-4 sm:grid-cols-2">

                    <ProfileInput
                      label="Full Name"
                      value={
                        editProfile.fullName
                      }
                      onChange={(value) =>
                        setEditProfile(
                          (current) => ({
                            ...current,
                            fullName:
                              value,
                          })
                        )
                      }
                      placeholder="Enter your full name"
                    />

                    <ProfileInput
                      label="Email"
                      value={user.email}
                      onChange={() => {}}
                      disabled
                    />

                    <ProfileInput
                      label="Age"
                      type="number"
                      min={13}
                      max={120}
                      value={
                        editProfile.age !==
                        null
                          ? String(
                              editProfile.age
                            )
                          : ""
                      }
                      onChange={(value) =>
                        setEditProfile(
                          (current) => ({
                            ...current,
                            age:
                              value === ""
                                ? null
                                : Number(
                                    value
                                  ),
                          })
                        )
                      }
                      placeholder="Enter your age"
                    />

                    <ProfileSelect
                      label="Gender"
                      value={
                        editProfile.gender
                      }
                      onChange={(value) =>
                        setEditProfile(
                          (current) => ({
                            ...current,
                            gender:
                              value,
                          })
                        )
                      }
                      options={[
                        "Male",
                        "Female",
                        "Non-binary",
                        "Prefer not to say",
                      ]}
                    />

                    <ProfileSelect
                      label="State / Union Territory"
                      value={
                        editProfile.state
                      }
                      onChange={(value) =>
                        setEditProfile(
                          (current) => ({
                            ...current,
                            state:
                              value,
                          })
                        )
                      }
                      options={
                        indianStates
                      }
                    />

                    <ProfileSelect
                      label="Country"
                      value={
                        editProfile.country
                      }
                      onChange={(value) =>
                        setEditProfile(
                          (current) => ({
                            ...current,
                            country:
                              value,
                          })
                        )
                      }
                      options={
                        countries
                      }
                    />

                  </div>

                  {/* ==================================================
                      BUTTONS
                  ================================================== */}

                  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={
                        handleCancelEdit
                      }
                      disabled={saving}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSaveProfile
                      }
                      disabled={saving}
                      className="relative overflow-hidden rounded-xl border border-violet-300/30 bg-gradient-to-b from-violet-400/30 via-violet-500/20 to-violet-700/15 px-6 py-3 text-xs font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,0.24)] transition hover:border-violet-200/50 hover:shadow-[0_10px_35px_rgba(124,58,237,0.32)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <span className="relative z-10">
                        {saving
                          ? "Saving..."
                          : "Save Profile"}
                      </span>

                      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />

                    </button>

                  </div>
                </>
              )}

            </div>
            
          </section>

          {/* ==================================================
              SUBSCRIPTION
          ================================================== */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-[0_15px_60px_rgba(0,0,0,0.25)]">

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-green-400">
                Subscription
              </h2>

              <p className="mt-0.5 text-[10px] text-zinc-500">
                Your current JMI subscription.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <div className="relative overflow-hidden rounded-2xl border border-violet-300/10 bg-gradient-to-br from-violet-500/[0.10] via-black/30 to-black/50 p-5">

                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300/70">
                      Current Plan
                    </p>

                    <p className="mt-1 text-xl font-semibold text-green-400">
                      JMI {planName}
                    </p>

                    <p className="mt-1 text-[10px] text-zinc-600">
                      Your JMI membership is active.
                    </p>

                  </div>

                  <span className="rounded-full border border-emerald-300/15 bg-emerald-400/[0.08] px-2.5 py-1 text-[9px] font-semibold text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.08)]">
                    {formatStatus(
                      subscriptionStatus
                    )}
                  </span>

                </div>

                <div className="relative mt-5 grid gap-4 sm:grid-cols-3">

                  <SubscriptionItem
                    label="Plan"
                    value={
                      subscription?.planSlug ||
                      "free"
                    }
                  />

                  <SubscriptionItem
                    label="Next Due Date"
                    value={
                      subscription?.currentPeriodEnd
                        ? formatDate(
                            subscription.currentPeriodEnd
                          )
                        : "No payment due"
                    }
                  />

                  <SubscriptionItem
                    label="Cancellation"
                    value={
                      subscription?.cancelAtPeriodEnd
                        ? "Scheduled"
                        : "Not scheduled"
                    }
                  />

                </div>

              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">

                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-violet-400 bg-white/[0.02] px-4 py-3 text-[10px] font-medium text-yellow-500"
                >
                  Change Plan
                </button>

                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-violet-400 bg-white/[0.02] px-4 py-3 text-[10px] font-medium text-red-500"
                >
                  Cancel Subscription
                </button>

              </div>

              <p className="mt-3 text-[9px] leading-4 text-zinc-500">
                Subscription management will become available
                when JMI billing is connected.
              </p>

            </div>

          </section>

          {/* ==================================================
              JMI ENTERTAINMENT
          ================================================== */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-[0_15px_60px_rgba(0,0,0,0.25)]">

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-yellow-500">
                JMI Entertainment 🎆
              </h2>

              <p className="mt-0.5 text-[10px] text-zinc-500">
                Your prediction and rewards activity.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-2.5 p-5 sm:grid-cols-4 sm:p-6">

              <StatCard
                label="Your Points"
                value="0"
              />

              <StatCard
                label="Rewards Earned"
                value="0"
              />

              <StatCard
                label="Total Predictions"
                value="0"
              />

              <StatCard
                label="Accurate Predictions"
                value="0"
              />

            </div>

          </section>

          {/* ==================================================
              ACCOUNT SETTINGS
          ================================================== */}

          <section className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]">

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">

              <h2 className="text-sm font-semibold text-white">
                Account Settings
              </h2>

              <p className="mt-0.5 text-[10px] text-zinc-500">
                Security and account management.
              </p>

            </div>

            <div className="space-y-2 p-5 sm:p-6">

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3.5 text-left opacity-60"
              >

                <div>

                  <p className="text-xs font-medium text-yellow-500">
                    Change Password
                  </p>

                  <p className="mt-0.5 text-[9px] text-zinc-700">
                    Coming later
                  </p>

                </div>

                <span className="text-[9px] text-zinc-700">
                  Disabled
                </span>

              </button>

              <button
                type="button"
                disabled
                className="flex w-full items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3.5 text-left opacity-60"
              >

                <div>

                  <p className="text-xs font-medium text-red-500">
                    Delete Account
                  </p>

                  <p className="mt-0.5 text-[9px] text-zinc-700">
                    Account deletion will be designed later
                  </p>

                </div>

                <span className="text-[9px] text-zinc-700">
                  Disabled
                </span>

              </button>

            </div>

          </section>

          {/* ==================================================
              LOGOUT
          ================================================== */}

          <div className="flex justify-center pb-4">

            <button
              type="button"
              onClick={
                handleLogout
              }
              disabled={
                loggingOut
              }
              className="rounded-xl border border-white/[0.6] bg-white/[0.025] px-7 py-2.5 text-[10px] font-semibold text-zinc-500 shadow-[0_5px_25px_rgba(0,0,0,0.2)] transition hover:border-red-400/20 hover:bg-red-500/[0.04] hover:text-red-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loggingOut
                ? "Signing out..."
                : "Log Out"}
            </button>

          </div>

          <footer className="border-t border-zinc-900">

            <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">

              <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">

                <div>

                  <p className="font-serif text-sm font-medium text-zinc-300">
                    Jeruto{" "}
                    <span className="text-yellow-400">
                      Movie Intelligence
                    </span>
                  </p>

                  <p className="mt-1 text-[9px] text-zinc-500">
                    India's Next Generation Movie Intelligence Platform
                  </p>

                </div>

                <p className="text-[9px] text-zinc-500">
                  JMI · People Intelligence
                </p>

              </div>

            </div>

          </footer>

        </div>

      </main>
    </>
  );
}

/* ============================================================
   PROFILE DISPLAY
   ============================================================ */

function ProfileDisplay({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3.5 transition hover:border-white/[0.10] hover:bg-white/[0.025]">

      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-yellow-500">
        {label}
      </p>

      <p className="mt-1.5 break-words text-xs text-zinc-300">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   PROFILE INPUT
   ============================================================ */

function ProfileInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        min={min}
        max={max}
        disabled={disabled}
        className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-3 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-violet-400/40 focus:bg-violet-500/[0.025] focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:text-zinc-600"
      />

    </label>
  );
}

/* ============================================================
   PROFILE SELECT
   ============================================================ */

function ProfileSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  options: string[];
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>

      <div className="relative">

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          style={{
            colorScheme: "dark",
          }}
          className="w-full appearance-none rounded-xl border border-white/[0.10] bg-[#0b0b10] px-3.5 py-3 pr-10 text-xs font-medium text-zinc-100 outline-none transition hover:border-white/[0.16] focus:border-violet-400/50 focus:bg-[#0d0b14] focus:ring-2 focus:ring-violet-500/10"
        >

          <option
            value=""
            className="bg-[#0b0b10] text-zinc-500"
          >
            Select{" "}
            {label.toLowerCase()}
          </option>

          {options.map(
            (option) => (
              <option
                key={option}
                value={option}
                className="bg-[#0b0b10] text-white"
              >
                {option}
              </option>
            )
          )}

        </select>

        {/* Custom arrow */}

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">

          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-500"
          >
            <path
              d="m6 9 6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

        </div>

      </div>

    </label>
  );
}

/* ============================================================
   SUBSCRIPTION ITEM
   ============================================================ */

function SubscriptionItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-pink-400">
        {label}
      </p>

      <p className="mt-1 text-[11px] text-zinc-300">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-violet-400 bg-black/25 p-4 transition hover:border-violet-400/15 hover:bg-violet-500/[0.025]">

      <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-pink-500">
        {label}
      </p>

      <p className="mt-1.5 text-lg font-semibold tracking-tight text-green-500">
        {value}
      </p>

    </div>
  );
}