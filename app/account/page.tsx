"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import PublicHeader from "@/app/(public)/components/PublicHeader";

/* ============================================================
   JMI PROFESSIONAL AVATARS

   Clean, professional profile identities.
   No comic characters or exaggerated faces.

   These use DiceBear's initials style, so no image files
   are stored in Supabase.
   ============================================================ */

const avatarOptions = [
  {
    id: "jmi-black",
    label: "JMI Black",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=JMI&backgroundColor=09090b&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=f4f4f5",
  },
  {
    id: "jmi-violet",
    label: "JMI Violet",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=JMI&backgroundColor=312e81&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=ede9fe",
  },
  {
    id: "jmi-gold",
    label: "JMI Gold",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=JMI&backgroundColor=713f12&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=fef3c7",
  },
  {
    id: "professional-01",
    label: "Professional 01",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Alex&backgroundColor=18181b&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=e4e4e7",
  },
  {
    id: "professional-02",
    label: "Professional 02",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Aria&backgroundColor=1e1b4b&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=e0e7ff",
  },
  {
    id: "professional-03",
    label: "Professional 03",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Sam&backgroundColor=172554&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=dbeafe",
  },
  {
    id: "professional-04",
    label: "Professional 04",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Riya&backgroundColor=4a044e&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=f5d0fe",
  },
  {
    id: "professional-05",
    label: "Professional 05",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Dev&backgroundColor=422006&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=fef3c7",
  },
  {
    id: "professional-06",
    label: "Professional 06",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Maya&backgroundColor=0c4a6e&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=e0f2fe",
  },
  {
    id: "professional-07",
    label: "Professional 07",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Ryan&backgroundColor=1c1917&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=f5f5f4",
  },
  {
    id: "professional-08",
    label: "Professional 08",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Anya&backgroundColor=581c87&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=f3e8ff",
  },
  {
    id: "professional-09",
    label: "Professional 09",
    url: "https://api.dicebear.com/10.x/initials/svg?seed=Noah&backgroundColor=334155&fontFamily=Arial&fontWeight=600&fontSize=38&textColor=e2e8f0",
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

type FunZoneStats = {
  totalPredictions: number;
  scoredPredictions: number;
  totalPoints: number;
  accuratePredictions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  bestPoints: number;
};

const emptyStats: FunZoneStats = {
  totalPredictions: 0,
  scoredPredictions: 0,
  totalPoints: 0,
  accuratePredictions: 0,
  averageAccuracy: 0,
  bestAccuracy: 0,
  bestPoints: 0,
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

  const [funZoneStats, setFunZoneStats] =
    useState<FunZoneStats>(emptyStats);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [showAvatars, setShowAvatars] =
    useState(false);

  const [showCustomImage, setShowCustomImage] =
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

      setLoading(false);

      /* --------------------------------------------------------
         Load JMI Fun Zone statistics
         -------------------------------------------------------- */

      try {
        const response =
          await fetch(
            "/api/fun-zone/stats",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        if (response.ok) {
          const data =
            await response.json();

          if (mounted) {
            setFunZoneStats({
              totalPredictions:
                Number(
                  data.totalPredictions || 0
                ),

              scoredPredictions:
                Number(
                  data.scoredPredictions || 0
                ),

              totalPoints:
                Number(
                  data.totalPoints || 0
                ),

              accuratePredictions:
                Number(
                  data.accuratePredictions || 0
                ),

              averageAccuracy:
                Number(
                  data.averageAccuracy || 0
                ),

              bestAccuracy:
                Number(
                  data.bestAccuracy || 0
                ),

              bestPoints:
                Number(
                  data.bestPoints || 0
                ),
            });
          }
        }
      } catch (error) {
        console.error(
          "Fun Zone statistics loading error:",
          error
        );
      } finally {
        if (mounted) {
          setStatsLoading(false);
        }
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

      profile.avatarId ||
        profile.avatarUrl,
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

    if (
      refreshError ||
      !refreshedSession.session
    ) {
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
        !Number.isInteger(
          editProfile.age
        ) ||
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
       VALIDATE CUSTOM IMAGE URL
       ========================================================== */

    const trimmedAvatarUrl =
      editProfile.avatarUrl.trim();

    if (trimmedAvatarUrl) {
      try {
        const parsedUrl =
          new URL(
            trimmedAvatarUrl
          );

        if (
          parsedUrl.protocol !==
            "http:" &&
          parsedUrl.protocol !==
            "https:"
        ) {
          throw new Error(
            "Invalid protocol"
          );
        }
      } catch {
        setErrorMessage(
          "Please enter a valid public image URL beginning with http:// or https://."
        );

        setSaving(false);

        return;
      }
    }

    /* ==========================================================
       FIND SELECTED AVATAR
       ========================================================== */

    const avatar =
      avatarOptions.find(
        (item) =>
          item.id ===
          editProfile.avatarId
      );

    /*
     * If a custom URL exists, use it.
     * Otherwise use the selected JMI avatar.
     */

    const avatarUrl =
      trimmedAvatarUrl ||
      avatar?.url ||
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
        editProfile.gender ||
        null,

      state:
        editProfile.state ||
        null,

      country:
        editProfile.country ||
        null,

      /*
       * A custom image does not need an avatar ID.
       */

      avatar_id:
        trimmedAvatarUrl
          ? null
          : editProfile.avatarId ||
            null,

      avatar_url:
        avatarUrl ||
        null,
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
       HANDLE UPDATE ERROR
       ========================================================== */

    if (updateError) {
      console.error(
        "Profile update error:",
        updateError
      );

      if (
        updateError.code ===
          "PGRST303" ||
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
        .insert(
          profilePayload
        );

      if (insertError) {
        console.error(
          "Profile insert error:",
          insertError
        );

        if (
          insertError.code ===
            "PGRST303" ||
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
        trimmedAvatarUrl
          ? ""
          : editProfile.avatarId,

      avatarUrl,
    };

    setProfile(savedProfile);

    setEditProfile(savedProfile);

    setEditing(false);

    setShowAvatars(false);

    setShowCustomImage(false);

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
    setShowCustomImage(false);
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
    setEditProfile(
      (current) => ({
        ...current,
        avatarId,
        avatarUrl,
      })
    );

    setShowCustomImage(false);
    setShowAvatars(false);
  }

  /* ==========================================================
     CUSTOM IMAGE URL
     ========================================================== */

  function handleCustomImageUrlChange(
    value: string
  ) {
    setEditProfile(
      (current) => ({
        ...current,
        avatarId: "",
        avatarUrl: value,
      })
    );
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
     NUMBER FORMAT
     ========================================================== */

  function formatNumber(
    value: number
  ) {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN"
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

          <div className="mx-auto max-w-5xl">

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

  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-[#050507] px-4 pb-20 pt-24 text-zinc-100 sm:px-6">

        <div className="mx-auto max-w-5xl">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-7">

            <div className="mb-5">

              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.12em] text-violet-400 transition hover:text-violet-300"
              >
                <span>←</span>
                <span>
                  Back to JMI Home
                </span>
              </Link>

            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-3 py-1">

              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">
                JMI Member Dashboard
              </span>

            </div>

            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              My Account
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-5 text-zinc-500">
              Your personal JMI profile, activity,
              points and member statistics.
            </p>

          </div>

          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <section className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/[0.11] via-white/[0.025] to-transparent p-5 shadow-[0_20px_80px_rgba(0,0,0,0.38)] sm:p-6">

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-yellow-500/[0.04] blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-4">

                {/* Avatar */}

                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setShowAvatars(true);
                  }}
                  className="group relative h-[82px] w-[82px] shrink-0 overflow-hidden rounded-full border-2 border-violet-300/30 bg-zinc-900 shadow-[0_0_0_3px_rgba(139,92,246,0.08),0_15px_45px_rgba(0,0,0,0.5)] transition duration-300 hover:scale-[1.03] hover:border-violet-300/60"
                >

                  <img
                    src={displayAvatar}
                    alt="JMI profile avatar"
                    className="h-full w-full object-cover"
                  />

                  <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/70 py-1 opacity-0 transition group-hover:opacity-100">

                    <span className="text-[7px] font-semibold uppercase tracking-[0.15em] text-white">
                      Change
                    </span>

                  </span>

                </button>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <p className="truncate text-lg font-semibold tracking-tight text-white">
                      {profile.fullName ||
                        "JMI User"}
                    </p>

                    <span className="rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-yellow-400">
                      Member
                    </span>

                  </div>

                  <p className="mt-1 break-all text-[11px] text-zinc-500">
                    {user.email}
                  </p>

                  <p className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-green-500">
                    Member since{" "}
                    {formatDate(
                      user.createdAt
                    )}
                  </p>

                </div>

              </div>

              {/* Profile completion */}

              <div className="w-full sm:w-[210px]">

                <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-3.5 backdrop-blur-xl">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-zinc-500">
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

                  <p className="mt-2 text-[8px] leading-4 text-zinc-600">
                    Complete your profile for
                    a better JMI experience.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              JMI POINTS / PRIMARY STATS
          ================================================== */}

          <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* JMI Points */}

            <StatCard
              eyebrow="JMI Points"
              value={
                statsLoading
                  ? "—"
                  : formatNumber(
                      funZoneStats.totalPoints
                    )
              }
              description="Total points earned"
              accent="yellow"
              large
            />

            {/* Predictions */}

            <StatCard
              eyebrow="Predictions"
              value={
                statsLoading
                  ? "—"
                  : formatNumber(
                      funZoneStats.totalPredictions
                    )
              }
              description="Fun Zone predictions"
              accent="violet"
            />

            {/* Accuracy */}

            <StatCard
              eyebrow="Avg Accuracy"
              value={
                statsLoading
                  ? "—"
                  : `${funZoneStats.averageAccuracy.toFixed(
                      1
                    )}%`
              }
              description="Across scored predictions"
              accent="violet"
            />

            {/* Best Accuracy */}

            <StatCard
              eyebrow="Best Accuracy"
              value={
                statsLoading
                  ? "—"
                  : `${funZoneStats.bestAccuracy.toFixed(
                      1
                    )}%`
              }
              description="Highest recorded accuracy"
              accent="yellow"
            />

          </section>

          {/* ==================================================
              JMI MEMBER PERFORMANCE
          ================================================== */}

          <section className="mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-[0_15px_60px_rgba(0,0,0,0.25)]">

            <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />

                  <h2 className="text-sm font-semibold text-white">
                    JMI Member Performance
                  </h2>

                </div>

                <p className="mt-1 text-[9px] text-zinc-600">
                  Your Fun Zone activity and prediction
                  performance.
                </p>

              </div>

              <Link
                href="/preview/fun-zone"
                className="inline-flex items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/[0.07] px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-violet-300 transition hover:border-violet-400/40 hover:bg-violet-500/[0.12]"
              >
                Enter Fun Zone →
              </Link>

            </div>

            <div className="grid gap-px bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">

              <PerformanceMetric
                label="Scored Predictions"
                value={
                  statsLoading
                    ? "—"
                    : formatNumber(
                        funZoneStats.scoredPredictions
                      )
                }
                note="Results evaluated"
              />

              <PerformanceMetric
                label="90%+ Accuracy"
                value={
                  statsLoading
                    ? "—"
                    : formatNumber(
                        funZoneStats.accuratePredictions
                      )
                }
                note="High-accuracy results"
              />

              <PerformanceMetric
                label="Best Prediction"
                value={
                  statsLoading
                    ? "—"
                    : `${funZoneStats.bestAccuracy.toFixed(
                        1
                      )}%`
                }
                note="Personal best"
              />

              <PerformanceMetric
                label="Best Score"
                value={
                  statsLoading
                    ? "—"
                    : `${funZoneStats.bestPoints} pts`
                }
                note="Maximum points in one result"
              />

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

                <h2 className="text-sm font-semibold text-white">
                  Profile
                </h2>

                <p className="mt-0.5 text-[10px] text-zinc-500">
                  Manage your JMI member information.
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
                        Profile Picture
                      </p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        JMI professional avatar or
                        your external profile image.
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
                      PROFILE PICTURE
                  ================================================== */}

                  <div className="mb-7">

                    <div className="mb-4 flex items-center gap-3">

                      <img
                        src={editingAvatar}
                        alt="Selected profile picture"
                        className="h-16 w-16 rounded-full border-2 border-violet-400/30 bg-zinc-900 object-cover shadow-[0_0_28px_rgba(139,92,246,0.20)]"
                      />

                      <div>

                        <p className="text-xs font-medium text-white">
                          Profile Picture
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-zinc-400">
                          Choose a professional JMI
                          avatar or use your own
                          image URL.
                        </p>

                      </div>

                    </div>

                    {/* Profile picture methods */}

                    <div className="grid gap-2 sm:grid-cols-2">

                      <button
                        type="button"
                        onClick={() => {
                          setShowAvatars(
                            (value) => !value
                          );
                          setShowCustomImage(
                            false
                          );
                        }}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          showAvatars
                            ? "border-violet-400/40 bg-violet-500/[0.09]"
                            : "border-white/[0.08] bg-white/[0.025] hover:border-violet-400/30 hover:bg-violet-500/[0.05]"
                        }`}
                      >

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                          JMI Avatars
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-zinc-600">
                          Choose a clean professional
                          profile identity.
                        </p>

                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomImage(
                            (value) => !value
                          );
                          setShowAvatars(
                            false
                          );
                        }}
                        className={`rounded-xl border px-4 py-3 text-left transition ${
                          showCustomImage
                            ? "border-yellow-400/40 bg-yellow-400/[0.06]"
                            : "border-white/[0.08] bg-white/[0.025] hover:border-yellow-400/30 hover:bg-yellow-400/[0.04]"
                        }`}
                      >

                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-yellow-400">
                          Use Image URL
                        </p>

                        <p className="mt-1 text-[9px] leading-4 text-zinc-600">
                          Use your own externally hosted
                          profile picture.
                        </p>

                      </button>

                    </div>

                    {/* ==================================================
                        JMI AVATARS
                    ================================================== */}

                    {showAvatars && (
                      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/30 p-4">

                        <div className="mb-4 flex items-center justify-between">

                          <div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
                              Professional Avatars
                            </p>

                            <p className="mt-0.5 text-[9px] text-zinc-700">
                              Minimal JMI member identities.
                            </p>

                          </div>

                          <span className="text-[9px] text-zinc-700">
                            {avatarOptions.length} options
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
                                title={
                                  avatar.label
                                }
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

                    {/* ==================================================
                        CUSTOM IMAGE URL
                    ================================================== */}

                    {showCustomImage && (
                      <div className="mt-4 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.025] p-4">

                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-yellow-400">
                          Custom Profile Picture
                        </p>

                        <p className="mt-1 max-w-xl text-[9px] leading-4 text-zinc-500">
                          Paste a publicly accessible image
                          URL. JMI stores only the URL and
                          does not upload the image to
                          our records.
                        </p>

                        <label className="mt-4 block">

                          <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-green-500">
                            Profile Image URL
                          </span>

                          <input
                            type="url"
                            value={
                              editProfile.avatarUrl
                            }
                            onChange={(event) =>
                              handleCustomImageUrlChange(
                                event.target.value
                              )
                            }
                            placeholder="https://example.com/your-photo.jpg"
                            className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3.5 py-3 text-xs text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/40 focus:bg-yellow-400/[0.02] focus:ring-2 focus:ring-yellow-500/10"
                          />

                        </label>

                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5">

                          <span className="mt-0.5 text-[10px] text-yellow-500">
                            ℹ️
                          </span>

                          <p className="text-[8px] leading-4 text-zinc-600">
                            Use a direct, publicly accessible
                            image URL.
                          </p>

                        </div>

                        {editProfile.avatarUrl && (
                          <div className="mt-4 flex items-center gap-3">

                            <img
                              src={
                                editProfile.avatarUrl
                              }
                              alt="Custom profile preview"
                              className="h-14 w-14 rounded-full border border-yellow-400/20 bg-zinc-900 object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />

                            <div>

                              <p className="text-[9px] font-medium text-zinc-300">
                                Image Preview
                              </p>

                              <p className="mt-0.5 text-[8px] text-zinc-700">
                                Your image will be stored as
                                an external URL.
                              </p>

                            </div>

                          </div>
                        )}

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
              QUICK ACCESS
          ================================================== */}

          <section className="mb-5">

            <div className="mb-3">

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-pink-500">
                Quick Access
              </p>

            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAccess
                href="/preview/fun-zone"
                icon="🎯"
                title="JMI Fun Zone"
                description="Play and earn JMI Points."
              />

              <QuickAccess
                href="/preview/movies"
                icon="🎬"
                title="Movies"
                description="Explore JMI movie intelligence."
              />

              <QuickAccess
                href="/preview/news"
                icon="◈"
                title="JMI News"
                description="Exclusive cinema intelligence."
              />

              <QuickAccess
                href="/"
                icon="⌂"
                title="JMI Home"
                description="Return to the main platform."
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
              className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500 shadow-[0_5px_25px_rgba(0,0,0,0.2)] transition hover:border-red-400/20 hover:bg-red-500/[0.04] hover:text-red-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loggingOut
                ? "Signing out..."
                : "Log Out"}
            </button>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

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
                  JMI · Member Dashboard
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
   STAT CARD
   ============================================================ */

function StatCard({
  eyebrow,
  value,
  description,
  accent,
  large = false,
}: {
  eyebrow: string;
  value: string;
  description: string;
  accent: "yellow" | "violet";
  large?: boolean;
}) {
  const accentClass =
    accent === "yellow"
      ? "text-yellow-400"
      : "text-violet-300";

  const borderClass =
    accent === "yellow"
      ? "border-yellow-400/10"
      : "border-violet-400/10";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${borderClass} bg-white/[0.025] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]`}
    >

      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-500/[0.035] blur-2xl" />

      <p className="relative text-[8px] font-semibold uppercase tracking-[0.16em] text-green-400">
        {eyebrow}
      </p>

      <p
        className={`relative mt-2 font-semibold tracking-tight ${accentClass} ${
          large
            ? "text-2xl"
            : "text-xl"
        }`}
      >
        {value}
      </p>

      <p className="relative mt-1 text-[9px] text-zinc-400">
        {description}
      </p>

    </div>
  );
}

/* ============================================================
   PERFORMANCE METRIC
   ============================================================ */

function PerformanceMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-black/20 px-4 py-4 sm:px-5">

      <p className="text-[8px] font-semibold uppercase tracking-[0.13em] text-yellow-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] text-zinc-500">
        {note}
      </p>

    </div>
  );
}

/* ============================================================
   QUICK ACCESS
   ============================================================ */

function QuickAccess({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-violet-400/20 hover:bg-violet-500/[0.04]"
    >

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-black/30 text-sm transition group-hover:border-violet-400/20">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-semibold text-green-400 transition group-hover:text-white">
            {title}
          </p>

          <p className="mt-1 text-[8px] leading-4 text-zinc-400">
            {description}
          </p>

        </div>

      </div>

    </Link>
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

      <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400">
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