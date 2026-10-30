"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../../../lib/supabase-browser";
import PublicHeader from "../../components/PublicHeader";

type ReactionType =
  | "like"
  | "love"
  | "haha"
  | "wow"
  | "sad"
  | "angry"
  | "dislike"
  | null;
  const REACTIONS: {
  type: Exclude<ReactionType, null>;
  emoji: string;
  label: string;
}[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
];
type PostType = "review" | "discussion";
type Section =
  | "feed"
  | "trending"
  | "create"
  | "notifications"
  | "following"
  | "find-members"
  | "profile";

type Reply = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  author: string;
  avatarUrl: string | null;
};

type SocialPost = {
  id: number;
  user_id: string;
  post_type: PostType;
  content: string;
  created_at: string;
  expires_at: string;
  author: string;
  avatarUrl: string | null;
  reactionCounts: Record<string, number>;
userReaction: ReactionType;
  hasReplied: boolean;
  replies: Reply[];
};

type Props = {
  initialPosts: SocialPost[];
  currentUserId: string | null;
  currentUserName: string | null;
};

const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: string;
}[] = [
  { id: "feed", label: "Public Feed", icon: "🌐" },
  { id: "trending", label: "Trending Now", icon: "🔥" },
  { id: "create", label: "Create Post", icon: "✍️" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "following", label: "Following", icon: "👥" },
  { id: "find-members", label: "Find Members", icon: "🔎" },
  { id: "profile", label: "My Profile", icon: "👤" },
];

function timeAgo(value: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "J"
  );
}

function Avatar({
  name,
  url,
  size = "normal",
}: {
  name: string;
  url: string | null;
  size?: "normal" | "small";
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-yellow-100 font-bold text-black ${
        size === "small" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function SocialSpaceClient({
  initialPosts = [],
  currentUserId: initialUserId = null,
  currentUserName: initialUserName = null,
}: Props) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    initialUserId
  );
  const [currentUserName, setCurrentUserName] = useState<string | null>(
    initialUserName
  );
  const [section, setSection] = useState<Section>("feed");
  const [postType, setPostType] = useState<PostType>("discussion");
  const [content, setContent] = useState("");
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
const [editingPostContent, setEditingPostContent] = useState("");
const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
const [editingReplyContent, setEditingReplyContent] = useState("");
const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [busyPostId, setBusyPostId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
const [members, setMembers] = useState<
  {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  }[]
>([]);
const [membersLoading, setMembersLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [followingLoaded, setFollowingLoaded] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const [notifications, setNotifications] = useState<
    {
      id: string;
      type: "like" | "reply";
      postId: number;
      actorName: string;
      actorAvatar: string | null;
      createdAt: string;
      text: string;
    }[]
  >([]);

  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  useEffect(() => {
  let cancelled = false;

  async function loadSocialSpace() {
    try {
      // Get the current signed-in user.
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError) {
        console.error("Social Space authentication error:", authError);
      }

      let userId: string | null = user?.id ?? null;
      let userName: string | null = null;

      // Load the user's public profile when signed in.
      if (userId) {
        const { data: profile, error: profileError } =
          await supabaseBrowser
            .from("profiles")
            .select("full_name")
            .eq("user_id", userId)
            .maybeSingle();

        if (profileError) {
          console.error("Social Space profile error:", profileError);
        }

        userName = profile?.full_name ?? null;
      }

      // Fetch posts that have not expired.
      const { data: postRows, error: postsError } =
        await supabaseBrowser
          .from("jmi_social_posts")
          .select("id, user_id, post_type, content, created_at, expires_at")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false });

      if (postsError) {
        throw postsError;
      }

      const rows = postRows ?? [];

      // Load profile names and avatars for post authors.
      const authorIds = [
        ...new Set(rows.map((post) => post.user_id)),
      ];

      const { data: profiles, error: authorsError } =
  authorIds.length > 0
    ? await supabaseBrowser.rpc("jmi_get_public_profiles", {
        p_user_ids: authorIds,
      })
    : { data: [], error: null };

      if (authorsError) {
        throw authorsError;
      }

      const profileMap = new Map<
  string,
  { name: string; avatar: string | null }
>(
  (
    (profiles ?? []) as Array<{
      user_id: string;
      full_name: string | null;
      avatar_url: string | null;
    }>
  ).map((profile) => [
    profile.user_id,
    {
      name: profile.full_name || "JMI Member",
      avatar: profile.avatar_url || null,
    },
  ])
);

      const postIds = rows.map((post) => post.id);

      // Load reactions and replies for these posts.
      const [reactionsResult, repliesResult] = await Promise.all([
        postIds.length > 0
          ? supabaseBrowser
              .from("jmi_social_reactions")
              .select("id, post_id, user_id, reaction")
              .in("post_id", postIds)
          : Promise.resolve({ data: [], error: null }),

        postIds.length > 0
          ? supabaseBrowser
              .from("jmi_social_replies")
              .select("id, post_id, user_id, content, created_at")
              .in("post_id", postIds)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (reactionsResult.error) throw reactionsResult.error;
      if (repliesResult.error) throw repliesResult.error;

      const reactions = reactionsResult.data ?? [];
      const replyRows = repliesResult.data ?? [];

      const replyAuthorIds = [
        ...new Set(replyRows.map((reply) => reply.user_id)),
      ];

      const { data: replyProfiles, error: replyProfilesError } =
        replyAuthorIds.length > 0
          ? await supabaseBrowser
              .from("profiles")
              .select("user_id, full_name, avatar_url")
              .in("user_id", replyAuthorIds)
          : { data: [], error: null };

      if (replyProfilesError) {
        throw replyProfilesError;
      }

      const replyProfileMap = new Map(
        (replyProfiles ?? []).map((profile) => [
          profile.user_id,
          {
            name: profile.full_name || "JMI Member",
            avatar: profile.avatar_url || null,
          },
        ])
      );

      const loadedPosts: SocialPost[] = rows.map((post) => {
        const postReactions = reactions.filter(
          (reaction) => reaction.post_id === post.id
        );

        const postReplies = replyRows
          .filter((reply) => reply.post_id === post.id)
          .map((reply) => ({
            ...reply,
            author:
              replyProfileMap.get(reply.user_id)?.name || "JMI Member",
            avatarUrl:
              replyProfileMap.get(reply.user_id)?.avatar || null,
          }));

        const myReaction =
          postReactions.find(
            (reaction) => reaction.user_id === userId
          )?.reaction ?? null;

        return {
          ...post,
          post_type: post.post_type as PostType,
          author: profileMap.get(post.user_id)?.name || "JMI Member",
          avatarUrl: profileMap.get(post.user_id)?.avatar || null,
          reactionCounts: Object.fromEntries(
  REACTIONS.map((reaction) => [
    reaction.type,
    postReactions.filter(
      (row) => row.reaction === reaction.type
    ).length,
  ])
),
          userReaction:
            myReaction === "like" || myReaction === "dislike"
              ? myReaction
              : null,
          hasReplied: postReplies.some(
            (reply) => reply.user_id === userId
          ),
          replies: postReplies,
        };
      });

      if (cancelled) return;

      setCurrentUserId(userId);
      setCurrentUserName(userName);
      setPosts(loadedPosts);
    } catch (error) {
      console.error("Could not load JMI Social Space:", error);

      if (!cancelled) {
        setMessage(
          "Could not load the community feed. Please refresh and try again."
        );
      }
    }
  }

  void loadSocialSpace();

  return () => {
    cancelled = true;
  };
}, []);

  const activePosts = useMemo(
  () =>
    (Array.isArray(posts) ? posts : []).filter(
      (post) =>
        post?.expires_at &&
        new Date(post.expires_at).getTime() > Date.now()
    ),
  [posts]
);

  const selectedProfilePosts = activePosts.filter(
    (post) => post.user_id === selectedProfile
  );

  const selectedMember = members.find(
  (member) => member.user_id === selectedProfile
);

const selectedProfileName =
  selectedMember?.full_name ||
  selectedProfilePosts[0]?.author ||
  (selectedProfile === currentUserId ? currentUserName : null) ||
  "JMI Member";

const selectedProfileAvatar =
  selectedMember?.avatar_url ||
  selectedProfilePosts[0]?.avatarUrl ||
  null;

  const visiblePosts = useMemo(() => {
    let result = [...activePosts];

 if (section === "profile") {
  const profileUserId = selectedProfile ?? currentUserId;

  result = result.filter(
    (post) => post.user_id === profileUserId
  );
}

    if (section === "following") {
      result = result.filter(
        (post) =>
          followedIds.includes(post.user_id) &&
          post.user_id !== currentUserId
      );
    }

   if (section === "trending") {
  result.sort(
    (a, b) =>
      Object.values(b.reactionCounts).reduce(
        (sum, count) => sum + count,
        0
      ) -
      Object.values(a.reactionCounts).reduce(
        (sum, count) => sum + count,
        0
      )
  );
} else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (post) =>
          post.content.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query)
      );
    }

    return result;
  }, [activePosts, section, currentUserId, followedIds, search]);

  async function loadFollowing() {
    if (!currentUserId) {
      setMessage("Please sign in to view your following feed.");
      return;
    }

    const { data, error } = await supabaseBrowser
      .from("jmi_social_follows")
      .select("following_id")
      .eq("follower_id", currentUserId);

    if (error) {
      setMessage("Could not load the following list.");
      return;
    }

    setFollowedIds((data ?? []).map((row) => row.following_id));
    setFollowingLoaded(true);
  }

  async function searchMembers(query = memberSearch) {
  if (!currentUserId) {
    setMembers([]);
    setMessage("Please sign in to find JMI members.");
    return;
  }

  setMembersLoading(true);
  setMessage("");

  try {
    const { data, error } = await supabaseBrowser.rpc(
      "jmi_search_members",
      {
        search_query: query.trim(),
        result_limit: 30,
      }
    );

    if (error) throw error;

    setMembers(data ?? []);
  } catch (error) {
    console.error("Find Members error:", error);
    setMessage("Could not load members. Please try again.");
  } finally {
    setMembersLoading(false);
  }
}

  async function loadNotifications() {
    if (!currentUserId) {
      setMessage("Please sign in to view notifications.");
      return;
    }

    const ownPostIds = activePosts
      .filter((post) => post.user_id === currentUserId)
      .map((post) => post.id);

    if (ownPostIds.length === 0) {
      setNotifications([]);
      setNotificationsLoaded(true);
      return;
    }

    const [reactionResult, replyResult] = await Promise.all([
      supabaseBrowser
        .from("jmi_social_reactions")
        .select("id, post_id, user_id, reaction, updated_at")
        .in("post_id", ownPostIds)
        .neq("user_id", currentUserId),

      supabaseBrowser
        .from("jmi_social_replies")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", ownPostIds)
        .neq("user_id", currentUserId)
        .order("created_at", { ascending: false }),
    ]);

    if (reactionResult.error || replyResult.error) {
      setMessage("Could not load notifications.");
      return;
    }

    const actors = [
      ...new Set([
        ...(reactionResult.data ?? []).map((row) => row.user_id),
        ...(replyResult.data ?? []).map((row) => row.user_id),
      ]),
    ];

    const profileResult =
      actors.length > 0
        ? await supabaseBrowser
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .in("user_id", actors)
        : { data: [], error: null };

    const profileMap = new Map(
      (profileResult.data ?? []).map((profile) => [
        profile.user_id,
        {
          name: profile.full_name || "JMI Member",
          avatar: profile.avatar_url,
        },
      ])
    );

    const reactionNotifications = (reactionResult.data ?? []).map((row) => ({
      id: `reaction-${row.id}`,
      type: "like" as const,
      postId: row.post_id,
      actorName: profileMap.get(row.user_id)?.name || "JMI Member",
      actorAvatar: profileMap.get(row.user_id)?.avatar || null,
      createdAt: row.updated_at,
      text: `reacted ${row.reaction === "like" ? "👍 to" : "👎 to"} your post`,
    }));

    const replyNotifications = (replyResult.data ?? []).map((row) => ({
      id: `reply-${row.id}`,
      type: "reply" as const,
      postId: row.post_id,
      actorName: profileMap.get(row.user_id)?.name || "JMI Member",
      actorAvatar: profileMap.get(row.user_id)?.avatar || null,
      createdAt: row.created_at,
      text: `replied: ${row.content}`,
    }));

    setNotifications(
      [...reactionNotifications, ...replyNotifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
    );
    setNotificationsLoaded(true);
  }

  async function navigateTo(nextSection: Section) {
    setSection(nextSection);
    setSelectedProfile(null);
    setMessage("");

   if (
  (nextSection === "following" ||
    nextSection === "find-members") &&
  currentUserId &&
  !followingLoaded
) {
  await loadFollowing();
}

if (nextSection === "find-members") {
  await searchMembers("");
}

    if (nextSection === "notifications" && !notificationsLoaded) {
      await loadNotifications();
    }
  }

  async function createPost() {
    if (!currentUserId) {
      setMessage("Please sign in to publish a post.");
      return;
    }

    const trimmed = content.trim();

    if (!trimmed) {
      setMessage("Write something before publishing.");
      return;
    }

    if (trimmed.length > 3000) {
      setMessage("Posts can contain a maximum of 3,000 characters.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseBrowser.auth.getUser();

      if (authError || !user || user.id !== currentUserId) {
        setMessage("Your session has expired. Please sign in again.");
        return;
      }

      const { data, error } = await supabaseBrowser
        .from("jmi_social_posts")
        .insert({
          user_id: user.id,
          post_type: postType,
          content: trimmed,
        })
        .select("id, user_id, post_type, content, created_at, expires_at")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Post was not returned by Supabase.");

   const { data: profile } = await supabaseBrowser
  .from("profiles")
  .select("full_name, avatar_url")
  .eq("user_id", user.id)
  .maybeSingle();

const newPost: SocialPost = {
  ...data,
  author: profile?.full_name || currentUserName || "JMI Member",
  avatarUrl: profile?.avatar_url || null,
 reactionCounts: Object.fromEntries(
  REACTIONS.map((reaction) => [reaction.type, 0])
),
  userReaction: null,
  hasReplied: false,
  replies: [],
};

      setPosts((previous) => [newPost, ...previous]);
      setContent("");
      setSection("feed");
      setMessage("Your post has been published!");
    } catch (error) {
      console.error(error);
      setMessage("Could not publish your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePost(post: SocialPost) {
  if (!currentUserId || post.user_id !== currentUserId) {
    setMessage("You can only edit your own posts.");
    return;
  }

  const trimmed = editingPostContent.trim();

  if (!trimmed) {
    setMessage("Post content cannot be empty.");
    return;
  }

  if (trimmed.length > 3000) {
    setMessage("Posts can contain a maximum of 3,000 characters.");
    return;
  }

  setSubmitting(true);
  setMessage("");

  try {
    const { data, error } = await supabaseBrowser
      .from("jmi_social_posts")
      .update({ content: trimmed })
      .eq("id", post.id)
      .eq("user_id", currentUserId)
      .select("id, content")
      .single();

    if (error) throw error;

    setPosts((previous) =>
      previous.map((item) =>
        item.id === post.id
          ? { ...item, content: data.content }
          : item
      )
    );

    setEditingPostId(null);
    setEditingPostContent("");
    setMessage("Your post has been updated.");
  } catch (error) {
    console.error("Update post error:", error);
    setMessage("Could not update your post. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

async function deletePost(post: SocialPost) {
  if (!currentUserId || post.user_id !== currentUserId) {
    setMessage("You can only delete your own posts.");
    return;
  }

  const confirmed = window.confirm(
    "Delete this post? This action cannot be undone."
  );

  if (!confirmed) return;

  setDeletingPostId(post.id);
  setMessage("");

  try {
    const { error } = await supabaseBrowser
      .from("jmi_social_posts")
      .delete()
      .eq("id", post.id)
      .eq("user_id", currentUserId);

    if (error) throw error;

    setPosts((previous) =>
      previous.filter((item) => item.id !== post.id)
    );

    setExpandedReplies((previous) =>
      previous.filter((id) => id !== post.id)
    );

    setReplyDrafts((previous) => {
      const next = { ...previous };
      delete next[post.id];
      return next;
    });

    setMessage("Your post has been deleted.");
  } catch (error) {
    console.error("Delete post error:", error);
    setMessage(
      "Could not delete your post. Please check its database relationships and try again."
    );
  } finally {
    setDeletingPostId(null);
  }
}

  async function toggleReaction(
  post: SocialPost,
  reaction: Exclude<ReactionType, null>
) {
  if (!currentUserId) {
    setMessage("Please sign in to react to posts.");
    return;
  }

  if (busyPostId !== null) return;

  setBusyPostId(post.id);
  setMessage("");

  const originalPost = post;
  const previousReaction = post.userReaction;
  const nextReaction = previousReaction === reaction ? null : reaction;

  setPosts((previous) =>
    previous.map((item) => {
      if (item.id !== post.id) return item;

     const reactionCounts = { ...item.reactionCounts };

if (previousReaction && previousReaction !== "dislike") {
  reactionCounts[previousReaction] = Math.max(
    0,
    (reactionCounts[previousReaction] ?? 0) - 1
  );
}

if (nextReaction && nextReaction !== "dislike") {
  reactionCounts[nextReaction] =
    (reactionCounts[nextReaction] ?? 0) + 1;
}

return {
  ...item,
  userReaction: nextReaction,
  reactionCounts,
};
    })
  );

  try {
    const {
      data: { user },
      error: authError,
    } = await supabaseBrowser.auth.getUser();

    if (authError || !user || user.id !== currentUserId) {
      throw new Error("Your session has expired.");
    }

    if (nextReaction === null) {
      const { error } = await supabaseBrowser
        .from("jmi_social_reactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseBrowser
        .from("jmi_social_reactions")
        .upsert(
          {
            post_id: post.id,
            user_id: user.id,
            reaction: nextReaction,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "post_id,user_id" }
        );

      if (error) throw error;
    }

    // Reload the feed so every reaction count stays accurate.
    const { data: reactionRows, error: reactionError } =
      await supabaseBrowser
        .from("jmi_social_reactions")
        .select("post_id, reaction")
        .eq("post_id", post.id);

    if (reactionError) throw reactionError;

    const rows = reactionRows ?? [];

 setPosts((previous) =>
  previous.map((item) =>
    item.id === post.id
      ? {
          ...item,
          reactionCounts: Object.fromEntries(
            REACTIONS.map((reaction) => [
              reaction.type,
              rows.filter(
                (row) => row.reaction === reaction.type
              ).length,
            ])
          ),
        }
      : item
  )
);
  } catch (error) {
    console.error(error);
    setMessage("Could not save your reaction. Please try again.");

    setPosts((previous) =>
      previous.map((item) =>
        item.id === post.id ? originalPost : item
      )
    );
  } finally {
    setBusyPostId(null);
  }
}

  async function createReply(post: SocialPost) {
    if (!currentUserId) {
      setMessage("Please sign in to reply.");
      return;
    }

    const trimmed = (replyDrafts[post.id] ?? "").trim();

    if (!trimmed) {
      setMessage("Write a reply first.");
      return;
    }

    if (trimmed.length > 1000) {
      setMessage("Replies can contain a maximum of 1,000 characters.");
      return;
    }

    if (post.hasReplied) {
      setMessage("You've already replied to this post.");
      return;
    }

    setBusyPostId(post.id);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user || user.id !== currentUserId) {
        setMessage("Please sign in again to continue.");
        return;
      }

      const { data, error } = await supabaseBrowser
        .from("jmi_social_replies")
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: trimmed,
        })
        .select("id, post_id, user_id, content, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          setMessage("You've already replied to this post.");
          setPosts((previous) =>
            previous.map((item) =>
              item.id === post.id ? { ...item, hasReplied: true } : item
            )
          );
          return;
        }

        throw error;
      }

      if (!data) throw new Error("Reply was not returned by Supabase.");

      const reply: Reply = {
        ...data,
        author: currentUserName || "JMI Member",
        avatarUrl: null,
      };

      setPosts((previous) =>
        previous.map((item) =>
          item.id === post.id
            ? {
                ...item,
                replies: [...item.replies, reply],
                hasReplied: true,
              }
            : item
        )
      );

      setReplyDrafts((previous) => ({ ...previous, [post.id]: "" }));
      setExpandedReplies((previous) =>
        previous.includes(post.id) ? previous : [...previous, post.id]
      );
      setMessage("Your reply has been published.");
    } catch (error) {
      console.error(error);
      setMessage("Could not publish your reply. Please try again.");
    } finally {
      setBusyPostId(null);
    }
  }

  async function updateReply(reply: Reply) {
  if (!currentUserId || reply.user_id !== currentUserId) {
    setMessage("You can only edit your own replies.");
    return;
  }

  const trimmed = editingReplyContent.trim();

  if (!trimmed) {
    setMessage("Reply content cannot be empty.");
    return;
  }

  if (trimmed.length > 1000) {
    setMessage("Replies can contain a maximum of 1,000 characters.");
    return;
  }

  setSubmitting(true);
  setMessage("");

  try {
    const { data, error } = await supabaseBrowser
      .from("jmi_social_replies")
      .update({ content: trimmed })
      .eq("id", reply.id)
      .eq("user_id", currentUserId)
      .select("id, content")
      .single();

    if (error) throw error;

    setPosts((previous) =>
      previous.map((post) => ({
        ...post,
        replies: post.replies.map((item) =>
          item.id === reply.id
            ? { ...item, content: data.content }
            : item
        ),
      }))
    );

    setEditingReplyId(null);
    setEditingReplyContent("");
    setMessage("Your reply has been updated.");
  } catch (error) {
    console.error("Update reply error:", error);
    setMessage("Could not update your reply. Please try again.");
  } finally {
    setSubmitting(false);
  }
}

async function deleteReply(reply: Reply) {
  if (!currentUserId || reply.user_id !== currentUserId) {
    setMessage("You can only delete your own replies.");
    return;
  }

  if (
    !window.confirm("Delete this reply? This action cannot be undone.")
  ) {
    return;
  }

  setDeletingReplyId(reply.id);
  setMessage("");

  try {
    const { error } = await supabaseBrowser
      .from("jmi_social_replies")
      .delete()
      .eq("id", reply.id)
      .eq("user_id", currentUserId);

    if (error) throw error;

    setPosts((previous) =>
      previous.map((post) => ({
        ...post,
        replies: post.replies.filter((item) => item.id !== reply.id),
        ...(post.id === reply.post_id ? { hasReplied: false } : {}),
      }))
    );

    setEditingReplyId(null);
    setEditingReplyContent("");
    setMessage("Your reply has been deleted.");
  } catch (error) {
    console.error("Delete reply error:", error);
    setMessage("Could not delete your reply. Please try again.");
  } finally {
    setDeletingReplyId(null);
  }
}

  async function toggleFollow(targetUserId: string) {
    if (!currentUserId) {
      setMessage("Please sign in to follow community members.");
      return;
    }

    if (targetUserId === currentUserId || followBusy) return;

    setFollowBusy(true);
    setMessage("");

    const alreadyFollowing = followedIds.includes(targetUserId);

    try {
      if (alreadyFollowing) {
        const { error } = await supabaseBrowser
          .from("jmi_social_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", targetUserId);

        if (error) throw error;

        setFollowedIds((previous) =>
          previous.filter((id) => id !== targetUserId)
        );
      } else {
        const { error } = await supabaseBrowser
          .from("jmi_social_follows")
          .insert({
            follower_id: currentUserId,
            following_id: targetUserId,
          });

        if (error) throw error;

        setFollowedIds((previous) => [...previous, targetUserId]);
      }

      setFollowingLoaded(true);
    } catch (error) {
      console.error(error);
      setMessage("Could not update your following list.");
    } finally {
      setFollowBusy(false);
    }
  }

  const feedTitle = {
    feed: "Public Feed",
    trending: "Trending Now",
    create: "Create a Post",
    notifications: "Notifications",
    following: "Following",
    "find-members": "Find Members",
    profile: "My Profile",
  }[section];

  const displayPosts =
    section === "profile" && selectedProfile
      ? selectedProfilePosts
      : visiblePosts;

  return (
    <div className="min-h-screen bg-white text-black">

      <PublicHeader />
      <div className="mb-0 mt-1 mx-auto flex max-w-7xl items-center justify-between bg-gray-300 gap-1 px-6 py-1 sm:px-6">
      <Link href="/" className="shrink-0">
            <span className="text-lg font-black tracking-tight">
              JMI <span className="text-yellow-500">SOCIAL</span>
            </span>
            <span className="hidden text-[10px] text-gray-500 sm:block">
              Cinema community
            </span>
          </Link>
          </div>
      {/* Navigation — no promotional page banner */}
      <div className="sticky top-0 z-30 border-b border-black/10 bg-white shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          

          <nav className="flex max-w-[95%] gap-0 overflow-x-auto sm:max-w-none sm:gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                title={item.label}
                className={`flex shrink-0 flex-col items-center justify-center gap-0 rounded-sm px-3 py-2 text-[08px] font-semibold transition sm:min-w-[92px] sm:flex-row sm:gap-2 sm:text-sm ${
                  section === item.id
                    ? "bg-yellow-400 text-black"
                    : "text-gray-600 hover:bg-yellow-50 hover:text-black"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        {message && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-black"
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0">
            <div className="mb-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-yellow-700">
                JMI Community
              </p>
              <h1 className="mt-1 text-xl font-black tracking-tight sm:text-3xl">
                {feedTitle}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {section === "feed"
                  ? "Discover what the community is talking about."
                  : section === "trending"
                    ? "Popular conversations ranked by reactions."
                    : section === "following"
                      ? "Posts from people you follow."
                      : section === "notifications"
                        ? "Activity on your posts."
                        : section === "profile"
                          ? "Your community activity."
                          : "Share your thoughts with movie lovers."}
              </p>
            </div>

            {(section === "feed" || section === "trending") && (
              <div className="mb-5">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts or members..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white"
                />
              </div>
            )}

            {section === "find-members" && (
  <section className="mb-6">
    {!currentUserId ? (
      <div className="rounded-2xl border border-gray-200 bg-yellow-50 p-6 text-center">
        <div className="text-3xl">👥</div>

        <h2 className="mt-3 font-bold">
          Discover the JMI community
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Sign in to find and follow other JMI members.
        </p>

        <Link
          href="/login"
          className="mt-4 inline-flex rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold"
        >
          Sign in
        </Link>
      </div>
    ) : (
      <>
        <div className="mb-5">
          <input
            value={memberSearch}
            onChange={(event) => {
              const value = event.target.value;
              setMemberSearch(value);
              void searchMembers(value);
            }}
            placeholder="Search members by name..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-yellow-400 focus:bg-white"
          />

          <p className="mt-2 text-xs text-gray-500">
            Find registered JMI members and follow their cinema discussions.
          </p>
        </div>

        {membersLoading ? (
          <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
            Searching members...
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No members found"
            description="Try another name or clear your search to browse members."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map((member) => {
              const isFollowing = followedIds.includes(member.user_id);

              return (
                <article
                  key={member.user_id}
                  className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <Avatar
                    name={member.full_name}
                    url={member.avatar_url}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold">
                      {member.full_name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      JMI Member
                    </p>

                    <button
                     onClick={() => {
  setSelectedProfile(member.user_id);
  setSection("profile");
  setMessage("");

  if (currentUserId && !followingLoaded) {
    void loadFollowing();
  }
}}
                      className="mt-2 text-xs font-semibold text-gray-600 underline"
                    >
                      View Profile
                    </button>
                  </div>

                  <button
                    onClick={() => toggleFollow(member.user_id)}
                    disabled={followBusy}
                    className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 ${
                      isFollowing
                        ? "border border-gray-300 bg-white text-gray-700"
                        : "bg-yellow-400 text-black hover:bg-yellow-300"
                    }`}
                  >
                    {isFollowing ? "Following" : "+ Follow"}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </>
    )}
  </section>
)}

            {section === "create" && (
              <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Avatar name={currentUserName || "JMI Member"} url={null} />
                  <div>
                    <h2 className="font-bold">Start a conversation</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Reviews and discussions are welcome.
                    </p>
                  </div>
                </div>

                {currentUserId ? (
                  <>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPostType("discussion")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                          postType === "discussion"
                            ? "border-yellow-400 bg-yellow-100"
                            : "border-gray-200"
                        }`}
                      >
                        💬 Movie Discussion
                      </button>
                      <button
                        onClick={() => setPostType("review")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                          postType === "review"
                            ? "border-yellow-400 bg-yellow-100"
                            : "border-gray-200"
                        }`}
                      >
                        ★ Movie Review
                      </button>
                    </div>

                    <textarea
                      value={content}
                      onChange={(event) =>
                        setContent(event.target.value.slice(0, 3000))
                      }
                      maxLength={3000}
                      rows={6}
                      placeholder={
                        postType === "review"
                          ? "Write your movie review..."
                          : "Start a discussion about a movie, actor, director, or cinema..."
                      }
                      className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-7 outline-none focus:border-yellow-400 focus:bg-white"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-gray-500">
                        {content.length}/3000 · Posts expire after 14 days
                      </span>
                      <button
                        onClick={createPost}
                        disabled={submitting || !content.trim()}
                        className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:opacity-50"
                      >
                        {submitting ? "Publishing..." : "Publish Post ↗️"}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="rounded-xl bg-yellow-50 p-4 text-sm leading-6">
                    <Link href="/login" className="font-bold underline">
                      Sign in
                    </Link>{" "}
                    to publish movie reviews and discussions.
                  </p>
                )}
              </section>
            )}

            {section === "profile" && (
              <section className="mb-5 rounded-2xl border border-gray-200 p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <Avatar name={currentUserName || "JMI Member"} url={null} />
                  <div>
                    <h2 className="text-lg font-bold">
                      {currentUserName || "JMI Member"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {currentUserId
                        ? `${activePosts.filter((post) => post.user_id === currentUserId).length} active posts`
                        : "Sign in to view your profile."}
                    </p>
                  </div>
                </div>
                {!currentUserId && (
                  <Link
                    href="/login"
                    className="mt-4 inline-flex rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold"
                  >
                    Sign in
                  </Link>
                )}
              </section>
            )}

            {section === "notifications" && !currentUserId && (
              <EmptyState
                icon="🔔"
                title="Sign in to see notifications"
                description="You'll see reactions and replies to your posts here."
              />
            )}

            {section === "notifications" &&
              currentUserId &&
              !notificationsLoaded && (
                <button
                  onClick={loadNotifications}
                  className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold"
                >
                  Load notifications
                </button>
              )}

            {section === "notifications" &&
              currentUserId &&
              notificationsLoaded &&
              (notifications.length === 0 ? (
                <EmptyState
                  icon="🔔"
                  title="You're all caught up"
                  description="New reactions and replies to your active posts will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => {
                        setSection("feed");
                        setSearch("");
                        setMessage(
                          `Open the post with ID ${notification.postId} in the feed.`
                        );
                      }}
                      className="flex w-full items-start gap-3 rounded-xl border border-gray-200 p-4 text-left hover:bg-yellow-50"
                    >
                      <Avatar
                        name={notification.actorName}
                        url={notification.actorAvatar}
                        size="small"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <strong>{notification.actorName}</strong>{" "}
                          {notification.text}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

            {section === "following" && !currentUserId && (
              <EmptyState
                icon="👥"
                title="Your community starts here"
                description="Sign in to follow members and see their posts in one place."
              />
            )}

            {section === "following" &&
              currentUserId &&
              !followingLoaded && (
                <button
                  onClick={loadFollowing}
                  className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold"
                >
                  Load following feed
                </button>
              )}

            {section === "profile" && !currentUserId && (
              <EmptyState
                icon="👤"
                title="Your profile"
                description="Sign in to see your account activity and posts."
              />
            )}

            {section !== "create" &&
              section !== "notifications" &&
              !(section === "following" && !followingLoaded) &&
              !(section === "profile" && !currentUserId) &&
              (displayPosts.length === 0 ? (
                <EmptyState
                  icon={section === "trending" ? "🔥" : "🎬"}
                  title={
                    section === "following"
                      ? "No posts from followed members yet"
                      : section === "profile"
                        ? "No active posts yet"
                        : section === "trending"
                          ? "No trending posts yet"
                          : "The conversation starts here"
                  }
                  description={
                    section === "following"
                      ? "Follow members to see their conversations here."
                      : section === "profile"
                        ? "Your active posts will appear here."
                        : "No active posts match this view. Try another search or start a discussion."
                  }
                />
              ) : (
                <div className="space-y-4">
                  {displayPosts.map((post, index) => (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-yellow-300"
                    >
                      {section === "trending" && index < 3 && (
                        <div className="border-b border-yellow-200 bg-yellow-50 px-5 py-2 text-xs font-bold text-yellow-800">
                          🔥 TRENDING #{index + 1}
                        </div>
                      )}

                      <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => {
                              setSelectedProfile(post.user_id);
                              setSection("profile");
                              if (!followingLoaded && currentUserId) {
                                void loadFollowing();
                              }
                            }}
                            title={`View ${post.author}'s profile`}
                            className="rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          >
                            <Avatar
                              name={post.author}
                              url={post.avatarUrl}
                            />
                          </button>

                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => {
                                setSelectedProfile(post.user_id);
                                setSection("profile");
                                if (!followingLoaded && currentUserId) {
                                  void loadFollowing();
                                }
                              }}
                              className="break-words text-left text-sm font-bold hover:underline"
                            >
                              {post.author}
                            </button>
                            <p className="mt-1 text-xs text-gray-500">
                              {timeAgo(post.created_at)}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                              post.post_type === "review"
                                ? "bg-yellow-100 text-yellow-900"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {post.post_type === "review"
                              ? "★ Movie Review"
                              : "💬 Discussion"}
                          </span>
                        </div>

                       {editingPostId === post.id ? (
  <div className="mt-5 space-y-3">
    <textarea
      value={editingPostContent}
      onChange={(event) =>
        setEditingPostContent(event.target.value.slice(0, 3000))
      }
      maxLength={3000}
      rows={5}
      className="w-full resize-y rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm leading-7 outline-none focus:border-yellow-400 focus:bg-white"
    />

    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-gray-500">
        {editingPostContent.length}/3000 characters
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setEditingPostId(null);
            setEditingPostContent("");
          }}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={() => updatePost(post)}
          disabled={submitting || !editingPostContent.trim()}
          className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
) : (
  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-800">
    {post.content}
  </p>
)}

                        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">

                          {currentUserId === post.user_id && (
  <>
    <button
      onClick={() => {
        setEditingPostId(post.id);
        setEditingPostContent(post.content);
        setMessage("");
      }}
      disabled={editingPostId !== null || deletingPostId !== null}
      className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-yellow-50 disabled:opacity-50"
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => deletePost(post)}
      disabled={deletingPostId === post.id || editingPostId !== null}
      className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deletingPostId === post.id ? "Deleting..." : "🗑️ Delete"}
    </button>
  </>
)}
                          
                           <div className="flex flex-wrap items-center gap-3">
  {/* Combined reactions display */}
  <div className="flex items-center gap-1">
    {REACTIONS.filter(
      (reaction) =>
        (post.reactionCounts[reaction.type] ?? 0) > 0
    )
      .sort(
        (a, b) =>
          (post.reactionCounts[b.type] ?? 0) -
          (post.reactionCounts[a.type] ?? 0)
      )
      .slice(0, 3)
      .map((reaction) => (
        <span
          key={reaction.type}
          title={`${reaction.label}: ${post.reactionCounts[reaction.type]}`}
          className="text-lg"
        >
          {reaction.emoji}
        </span>
      ))}

    <span className="ml-1 text-xs font-semibold text-gray-600">
      {Object.values(post.reactionCounts).reduce(
        (total, count) => total + count,
        0
      )}
      {" "}
      {Object.values(post.reactionCounts).reduce(
        (total, count) => total + count,
        0
      ) === 1
        ? "reaction"
        : "reactions"}
    </span>
  </div>

  {/* React button */}
  <div className="relative">
    <div className="flex flex-wrap items-center gap-1">
      {REACTIONS.map((reaction) => {
        const selected = post.userReaction === reaction.type;

        return (
          <button
            key={reaction.type}
            onClick={() => toggleReaction(post, reaction.type)}
            disabled={busyPostId === post.id}
            title={reaction.label}
            aria-label={reaction.label}
            className={`rounded-lg border px-2 py-1 text-sm transition ${
              selected
                ? "border-yellow-400 bg-yellow-100"
                : "border-transparent hover:border-yellow-300 hover:bg-yellow-50"
            } disabled:opacity-50`}
          >
            {reaction.emoji}
          </button>
        );
      })}
    </div>
  </div>
</div>

                          <button
                            onClick={() =>
                              setExpandedReplies((previous) =>
                                previous.includes(post.id)
                                  ? previous.filter((id) => id !== post.id)
                                  : [...previous, post.id]
                              )
                            }
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                          >
                            ↩️ {post.replies.length}{" "}
                            {post.replies.length === 1 ? "Reply" : "Replies"}
                          </button>

                          {section === "profile" &&
                            selectedProfile &&
                            selectedProfile !== currentUserId && (
                              <button
                                onClick={() =>
                                  toggleFollow(selectedProfile)
                                }
                                disabled={followBusy}
                                className="ml-auto rounded-xl bg-yellow-400 px-3 py-2 text-xs font-bold disabled:opacity-50"
                              >
                                {followBusy
                                  ? "Please wait..."
                                  : followedIds.includes(selectedProfile)
                                    ? "✓ Following"
                                    : "+ Follow"}
                              </button>
                            )}
                        </div>

                        {expandedReplies.includes(post.id) && (
                          <div className="mt-5 border-t border-gray-100 pt-5">
                            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                              Conversation
                            </h4>

                            {post.replies.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No replies yet.
                              </p>
                            ) : (
                              <div className="space-y-4">
                                {post.replies.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="flex items-start gap-3"
                                  >
                                    <button
                                      onClick={() => {
                                        setSelectedProfile(reply.user_id);
                                        setSection("profile");
                                      }}
                                      title={`View ${reply.author}'s profile`}
                                    >
                                      <Avatar
                                        name={reply.author}
                                        url={reply.avatarUrl}
                                        size="small"
                                      />
                                    </button>
                                    <div className="min-w-0 flex-1 rounded-xl bg-gray-50 p-3">
                                      <button
                                        onClick={() => {
                                          setSelectedProfile(reply.user_id);
                                          setSection("profile");
                                        }}
                                        className="text-xs font-bold hover:underline"
                                      >
                                        {reply.author}
                                      </button>
                                     {editingReplyId === reply.id ? (
  <div className="mt-2 space-y-2">
    <textarea
      value={editingReplyContent}
      onChange={(event) =>
        setEditingReplyContent(event.target.value.slice(0, 1000))
      }
      maxLength={1000}
      rows={3}
      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-yellow-400"
    />

    <div className="flex flex-wrap justify-between gap-2">
      <span className="text-xs text-gray-500">
        {editingReplyContent.length}/1000
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => {
            setEditingReplyId(null);
            setEditingReplyContent("");
          }}
          className="rounded-lg border px-3 py-2 text-xs font-semibold"
        >
          Cancel
        </button>

        <button
          onClick={() => updateReply(reply)}
          disabled={submitting || !editingReplyContent.trim()}
          className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
) : (
  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
    {reply.content}
  </p>
)}

{currentUserId === reply.user_id && (
  <div className="mt-3 flex gap-2">
    <button
      onClick={() => {
        setEditingReplyId(reply.id);
        setEditingReplyContent(reply.content);
        setMessage("");
      }}
      disabled={editingReplyId !== null || deletingReplyId !== null}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold hover:bg-yellow-50 disabled:opacity-50"
    >
      ✏️ Edit
    </button>

    <button
      onClick={() => deleteReply(reply)}
      disabled={deletingReplyId === reply.id || editingReplyId !== null}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {deletingReplyId === reply.id ? "Deleting..." : "🗑️ Delete"}
    </button>
  </div>
)}
                                      <p className="mt-1 text-[10px] text-gray-400">
                                        {timeAgo(reply.created_at)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-5">
                              {currentUserId ? (
                                post.hasReplied ? (
                                  <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                                    You've already replied to this post.
                                  </p>
                                ) : (
                                  <>
                                    <textarea
                                      value={replyDrafts[post.id] ?? ""}
                                      onChange={(event) =>
                                        setReplyDrafts((previous) => ({
                                          ...previous,
                                          [post.id]: event.target.value.slice(
                                            0,
                                            1000
                                          ),
                                        }))
                                      }
                                      rows={2}
                                      maxLength={1000}
                                      placeholder="Write a thoughtful reply..."
                                      className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-yellow-400 focus:bg-white"
                                    />
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-[10px] text-gray-400">
                                        {(replyDrafts[post.id] ?? "").length}
                                        /1000
                                      </span>
                                      <button
                                        onClick={() => createReply(post)}
                                        disabled={
                                          busyPostId === post.id ||
                                          !(replyDrafts[post.id] ?? "").trim()
                                        }
                                        className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold disabled:opacity-50"
                                      >
                                        {busyPostId === post.id
                                          ? "Sending..."
                                          : "Reply ↗️"}
                                      </button>
                                    </div>
                                  </>
                                )
                              ) : (
                                <p className="text-xs text-gray-500">
                                  <Link
                                    href="/login"
                                    className="font-bold underline"
                                  >
                                    Sign in
                                  </Link>{" "}
                                  to reply.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ))}
          </main>

          {/* Community guidelines stay visible */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            {selectedProfile && section === "profile" && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={selectedProfileName}
                    url={selectedProfileAvatar}
                  />
                  <div>
                    <h2 className="font-bold">{selectedProfileName}</h2>
                    <p className="text-xs text-gray-500">
                      Public community profile
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  {selectedProfilePosts.length} active posts
                </p>

                {selectedProfile !== currentUserId && (
                  <button
                    onClick={() => toggleFollow(selectedProfile)}
                    disabled={followBusy}
                    className="mt-4 w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold disabled:opacity-50"
                  >
                    {followBusy
                      ? "Please wait..."
                      : followedIds.includes(selectedProfile)
                        ? "✓ Following · Unfollow"
                        : "+ Follow"}
                  </button>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-lg">
                  📌
                </span>
                <div>
                  <h2 className="font-bold">Community Guidelines</h2>
                  <p className="text-xs text-gray-500">
                    Help keep JMI welcoming.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <Guideline
                  icon="🎬"
                  title="Keep it cinematic"
                  text="Share genuine movie reviews and relevant cinema discussions."
                />
                <Guideline
                  icon="🤝"
                  title="Respect opinions"
                  text="Disagree with ideas, not the people sharing them."
                />
                <Guideline
                  icon="🚫"
                  title="No spam or abuse"
                  text="Keep contributions relevant, respectful, and constructive."
                />
                <Guideline
                  icon="⌛"
                  title="Posts expire"
                  text="Posts remain visible for 14 days."
                />
                <Guideline
                  icon="🔒"
                  title="Protect privacy"
                  text="Don't publish personal information about others."
                />
              </div>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-800">
                Powered by JMI
              </p>
              <h3 className="mt-3 text-xl font-black">
                Cinema is better together.
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                A space for movie lovers to share perspectives and celebrate
                Indian cinema.
              </p>
            </div>

            <p className="px-2 text-center text-[11px] leading-5 text-gray-400">
              JMI Social Space · Community conversations
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Guideline({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-gray-500">{text}</p>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default SocialSpaceClient;