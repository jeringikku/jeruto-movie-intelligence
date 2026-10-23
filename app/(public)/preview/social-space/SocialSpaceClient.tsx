"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "../../../../lib/supabase-browser";

type ReactionType = "like" | "dislike" | null;
type PostType = "review" | "discussion";

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
  likeCount: number;
  dislikeCount: number;
  userReaction: ReactionType;
  hasReplied: boolean;
  replies: Reply[];
};

type Props = {
  initialPosts: SocialPost[];
  currentUserId: string | null;
  currentUserName: string | null;
};

function getSupabase() {
  return supabaseBrowser;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "J";
}

function timeAgo(dateString: string) {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
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
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cyan-400/30 to-indigo-500/30 font-bold text-cyan-100 ${
        size === "small" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm"
      }`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials(name)
      )}
    </div>
  );
}

function SocialSpaceClient({
  initialPosts,
  currentUserId,
  currentUserName,
}: Props) {
  const [posts, setPosts] = useState<SocialPost[]>(
    Array.isArray(initialPosts) ? initialPosts : []
  );

  const [activeTab, setActiveTab] = useState<
    "home" | "following" | "activity"
  >("home");

  const [postType, setPostType] = useState<PostType>("discussion");
  const [content, setContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [busyPostId, setBusyPostId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const activePosts = useMemo(
    () =>
      (Array.isArray(posts) ? posts : []).filter(
        (post) =>
          post?.expires_at &&
          new Date(post.expires_at).getTime() > Date.now()
      ),
    [posts]
  );

  const visiblePosts = useMemo(() => {
    let result = activePosts;

    if (activeTab === "activity") {
      result = result.filter((post) => post.user_id === currentUserId);
    }

    if (activeTab === "following") {
      // The following feed will be connected to the follow table separately.
      result = [];
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
  }, [activePosts, activeTab, currentUserId, search]);

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
      const supabase = getSupabase();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.id !== currentUserId) {
        setMessage("Your session has expired. Please sign in again.");
        return;
      }

      const { data, error } = await supabase
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

      const newPost: SocialPost = {
        ...data,
        author: currentUserName || "JMI Member",
        avatarUrl: null,
        likeCount: 0,
        dislikeCount: 0,
        userReaction: null,
        hasReplied: false,
        replies: [],
      };

      setPosts((previous) => [newPost, ...previous]);
      setContent("");
      setActiveTab("home");
      setMessage("Your post has been published!");
    } catch (error) {
      console.error(error);
      setMessage("Could not publish your post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleReaction(
    post: SocialPost,
    reaction: "like" | "dislike"
  ) {
    if (!currentUserId) {
      setMessage("Please sign in to react to posts.");
      return;
    }

    if (busyPostId !== null) return;

    setBusyPostId(post.id);
    setMessage("");

    const previousReaction = post.userReaction;

    const nextReaction =
      previousReaction === reaction ? null : reaction;

    try {
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== currentUserId) {
        setMessage("Please sign in again to continue.");
        return;
      }

      setPosts((previous) =>
        previous.map((item) => {
          if (item.id !== post.id) return item;

          let likeCount = item.likeCount;
          let dislikeCount = item.dislikeCount;

          if (previousReaction === "like") likeCount--;
          if (previousReaction === "dislike") dislikeCount--;

          if (nextReaction === "like") likeCount++;
          if (nextReaction === "dislike") dislikeCount++;

          return {
            ...item,
            likeCount: Math.max(0, likeCount),
            dislikeCount: Math.max(0, dislikeCount),
            userReaction: nextReaction,
          };
        })
      );

      if (nextReaction === null) {
        const { error } = await supabase
          .from("jmi_social_reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
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
    } catch (error) {
      console.error(error);
      setMessage("Could not save your reaction. Refresh and try again.");

      // Restore the previous reaction and counts after a failed request.
      setPosts((previous) =>
        previous.map((item) => {
          if (item.id !== post.id) return item;

          let likeCount = item.likeCount;
          let dislikeCount = item.dislikeCount;

          if (nextReaction === "like") likeCount--;
          if (nextReaction === "dislike") dislikeCount--;

          if (previousReaction === "like") likeCount++;
          if (previousReaction === "dislike") dislikeCount++;

          return {
            ...item,
            likeCount: Math.max(0, likeCount),
            dislikeCount: Math.max(0, dislikeCount),
            userReaction: previousReaction,
          };
        })
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
      const supabase = getSupabase();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || user.id !== currentUserId) {
        setMessage("Please sign in again to continue.");
        return;
      }

      const { data, error } = await supabase
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
              item.id === post.id
                ? { ...item, hasReplied: true }
                : item
            )
          );

          return;
        }

        throw error;
      }

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

      setReplyDrafts((previous) => ({
        ...previous,
        [post.id]: "",
      }));

      setExpandedReplies((previous) =>
        previous.includes(post.id)
          ? previous
          : [...previous, post.id]
      );

      setMessage("Your reply has been published.");
    } catch (error) {
      console.error(error);
      setMessage("Could not publish your reply. Please try again.");
    } finally {
      setBusyPostId(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-12">
       

      {/* Responsive JMI Social Navigation */}
<div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-gray-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:px-4">
<div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-3 sm:mb-3">
<a href="/" className="shrink-0 text-base font-black tracking-tight text-black sm:text-xl">
JMI <span className="text-yellow-500">SOCIAL</span>
</a>

        <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
          Cinema community
        </span>
      </div>

      <nav className="grid grid-cols-6 gap-1">
        {[
          { id: "home", icon: "⌂", label: "Feed" },
          { id: "trending", icon: "↗️", label: "Trending" },
          { id: "create", icon: "+", label: "Create" },
          { id: "notifications", icon: "♧", label: "Alerts" },
          { id: "following", icon: "♡", label: "Following" },
          { id: "activity", icon: "☻", label: "Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (
                tab.id === "home" ||
                tab.id === "following" ||
                tab.id === "activity"
              ) {
                setActiveTab(tab.id);
              } else {
                setMessage(
                  tab.id === "trending"
                    ? "Trending view will be connected in a later update."
                    : tab.id === "create"
                      ? currentUserId
                        ? "Use the post composer below to publish."
                        : "Please sign in to create a post."
                      : "Notifications will be connected in a later update."
                );
              }

              if (tab.id === "create" && !currentUserId) {
                window.location.href = "/login";
              }
            }}
            title={tab.label}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-2 transition sm:rounded-xl sm:py-3 ${
              activeTab === tab.id
                ? "bg-yellow-400 text-black"
                : "text-gray-600 hover:bg-yellow-50 hover:text-black"
            }`}
          >
            <span className="text-sm font-bold leading-none sm:text-xl">
              {tab.icon}
            </span>
            <span className="w-full truncate text-center text-[9px] font-semibold sm:text-base">
              {tab.label}
            </span>
          </button>
        ))}
      </nav>

      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search community posts..."
        className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-black outline-none placeholder:text-gray-400 focus:border-yellow-400 sm:text-sm"
      />
    </div>

        {message && (
          <div
            role="status"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3 text-sm text-cyan-100"
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
              className="text-cyan-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-5">
            {/* Create post */}
            {activeTab === "home" && (
              <div className="rounded-2xl border border-white/10 bg-[#0e1422]/90 p-5 shadow-xl shadow-black/10 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <Avatar
                    name={currentUserName || "JMI Member"}
                    url={null}
                  />
                  <div>
                    <h2 className="font-bold text-white">Start a conversation</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      What&apos;s on your cinematic mind?
                    </p>
                  </div>
                </div>

                {currentUserId ? (
                  <>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPostType("discussion")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          postType === "discussion"
                            ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200"
                            : "border-white/10 bg-white/[0.02] text-slate-400"
                        }`}
                      >
                        💬 Movie Discussion
                      </button>
                      <button
                        onClick={() => setPostType("review")}
                        className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                          postType === "review"
                            ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
                            : "border-white/10 bg-white/[0.02] text-slate-400"
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
                      placeholder={
                        postType === "review"
                          ? "Share your review. What worked, what didn't, and is it worth watching?"
                          : "Start a discussion about a movie, actor, filmmaker, or anything cinema-related..."
                      }
                      rows={5}
                      maxLength={3000}
                      className="w-full resize-y rounded-xl border border-white/10 bg-[#080d17] p-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs text-slate-500">
                        {content.length}/3000 characters · Posts expire after
                        14 days
                      </span>
                      <button
                        onClick={createPost}
                        disabled={submitting || !content.trim()}
                        className="rounded-xl bg-gradient-to-r from-cyan-300 to-blue-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? "Publishing..." : "Publish Post ↗️"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-sm leading-6 text-slate-300">
                      You can browse the community freely. Sign in to share
                      your reviews, start discussions, and react to posts.
                    </p>
                    <a
                      href="/login"
                      className="mt-4 inline-flex rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                    >
                      Sign in to participate
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Feed heading */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {activeTab === "home"
                    ? "Community Feed"
                    : activeTab === "following"
                      ? "Following"
                      : "My Posts"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {visiblePosts.length}{" "}
                  {visiblePosts.length === 1 ? "post" : "posts"}
                </p>
              </div>
              {activeTab === "home" && (
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-400">
                  Latest first
                </span>
              )}
            </div>

            {/* Posts */}
            {visiblePosts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
                <div className="text-4xl">🎬</div>
                <h3 className="mt-4 font-bold text-white">
                  {activeTab === "following"
                    ? "Your following feed is coming next"
                    : activeTab === "activity"
                      ? "No posts yet"
                      : "The conversation starts here"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                  {activeTab === "following"
                    ? "Follow your favourite community members once following is enabled."
                    : activeTab === "activity"
                      ? "Posts you publish will appear here."
                      : "No active posts match your search. Try another search or start a discussion."}
                </p>
              </div>
            ) : (
              visiblePosts.map((post) => {
                const repliesOpen = expandedReplies.includes(post.id);

                return (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1422]/90 shadow-xl shadow-black/10 transition hover:border-white/[0.16]"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex items-start gap-3">
                        <Avatar name={post.author} url={post.avatarUrl} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="break-words text-sm font-bold text-white">
                              {post.author}
                            </h3>
                            {post.user_id === currentUserId && (
                              <span className="rounded-full bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {timeAgo(post.created_at)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                            post.post_type === "review"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
                              : "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                          }`}
                        >
                          {post.post_type === "review"
                            ? "★ Movie Review"
                            : "💬 Discussion"}
                        </span>
                      </div>

                      <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-200">
                        {post.content}
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-4">
                        <button
                          onClick={() => toggleReaction(post, "like")}
                          disabled={busyPostId === post.id}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            post.userReaction === "like"
                              ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200"
                              : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          👍 {post.likeCount}
                        </button>

                        <button
                          onClick={() => toggleReaction(post, "dislike")}
                          disabled={busyPostId === post.id}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            post.userReaction === "dislike"
                              ? "border-rose-300/30 bg-rose-300/10 text-rose-200"
                              : "border-white/10 text-slate-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          👎 {post.dislikeCount}
                        </button>

                        <button
                          onClick={() =>
                            setExpandedReplies((previous) =>
                              previous.includes(post.id)
                                ? previous.filter((id) => id !== post.id)
                                : [...previous, post.id]
                            )
                          }
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                        >
                          ↩️ {post.replies.length}{" "}
                          {post.replies.length === 1 ? "Reply" : "Replies"}
                        </button>

                        {post.user_id === currentUserId && (
                          <span className="ml-auto text-[11px] text-slate-500">
                            Expires {new Date(post.expires_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Replies */}
                      {repliesOpen && (
                        <div className="mt-5 border-t border-white/[0.07] pt-5">
                          <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Conversation
                          </h4>

                          {post.replies.length === 0 ? (
                            <p className="text-sm text-slate-500">
                              No replies yet. Be the first to respond.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {post.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start gap-3"
                                >
                                  <Avatar
                                    name={reply.author}
                                    url={reply.avatarUrl}
                                    size="small"
                                  />
                                  <div className="min-w-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-bold text-white">
                                        {reply.author}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {timeAgo(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-5">
                            {currentUserId ? (
                              post.hasReplied ? (
                                <p className="rounded-xl bg-white/[0.03] px-4 py-3 text-xs text-slate-400">
                                  You have already replied to this post.
                                </p>
                              ) : (
                                <>
                                  <textarea
                                    value={replyDrafts[post.id] ?? ""}
                                    onChange={(event) =>
                                      setReplyDrafts((previous) => ({
                                        ...previous,
                                        [post.id]: event.target.value.slice(0, 1000),
                                      }))
                                    }
                                    rows={2}
                                    maxLength={1000}
                                    placeholder="Write a thoughtful reply..."
                                    className="w-full resize-y rounded-xl border border-white/10 bg-[#080d17] p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                                  />
                                  <div className="mt-2 flex items-center justify-between gap-3">
                                    <span className="text-[10px] text-slate-500">
                                      {(replyDrafts[post.id] ?? "").length}/1000
                                    </span>
                                    <button
                                      onClick={() => createReply(post)}
                                      disabled={
                                        busyPostId === post.id ||
                                        !(replyDrafts[post.id] ?? "").trim()
                                      }
                                      className="rounded-lg bg-cyan-300 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
                                    >
                                      {busyPostId === post.id
                                        ? "Sending..."
                                        : "Reply ↗️"}
                                    </button>
                                  </div>
                                </>
                              )
                            ) : (
                              <p className="text-xs text-slate-400">
                                <a
                                  href="/login"
                                  className="font-semibold text-cyan-200 hover:text-cyan-100"
                                >
                                  Sign in
                                </a>{" "}
                                to join the conversation.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-white/10 bg-[#0e1422]/90 p-5">
              <h3 className="font-bold text-white">Community Guidelines</h3>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-400">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎬</span>
                  <p>
                    <strong className="text-slate-200">Keep it cinematic.</strong>
                    <br />
                    Share reviews and discussions about movies and filmmaking.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🤝</span>
                  <p>
                    <strong className="text-slate-200">Respect opinions.</strong>
                    <br />
                    Disagree with ideas, not the people sharing them.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🚫</span>
                  <p>
                    <strong className="text-slate-200">No spam.</strong>
                    <br />
                    Keep posts relevant, genuine, and respectful.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">⌛</span>
                  <p>
                    <strong className="text-slate-200">Posts expire.</strong>
                    <br />
                    Posts remain visible for 14 days.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-indigo-300/15 bg-gradient-to-br from-indigo-500/10 to-cyan-400/5 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Powered by JMI
              </div>
              <h3 className="mt-3 text-xl font-black text-white">
                Cinema is better together.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                A space for movie lovers to exchange ideas, share perspectives,
                and celebrate Indian cinema.
              </p>
            </div>

            <p className="px-2 text-center text-[11px] leading-5 text-slate-600">
              JMI Social Space · Community conversations
              <br />
              Posts are removed from the feed after 14 days.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default SocialSpaceClient;