"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Movie = {
  id: number;
  title: string;
};

type NewsArticle = {
  id: number;
  slug: string;
  article_type: string;
  title: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  article_content: string;
  movie_id: number | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type ArticleImage = {
  id?: number;
  image_url: string;
  caption: string;
  sort_order: number;
};

const ARTICLE_TYPES = [
  "Review",
  "Box Office",
  "Advance Booking",
  "Movie Update",
  "Gossips",
  "Exclusive Updates",
  "Film Discussions",
];

const STATUS_OPTIONS = [
  "draft",
  "published",
  "archived",
];

export default function JMIExclusiveNewsAdminPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const [articleType, setArticleType] =
    useState("Exclusive Updates");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnailUrl, setThumbnailUrl] =
    useState("");

  const [movieId, setMovieId] = useState("");

  const [articleContent, setArticleContent] =
    useState("");

  const [status, setStatus] =
    useState("draft");

  const [articleImages, setArticleImages] =
    useState<ArticleImage[]>([]);

  // --------------------------------------------------
  // EDITING
  // --------------------------------------------------

  const [editingArticle, setEditingArticle] =
    useState<NewsArticle | null>(null);

  // --------------------------------------------------
  // LOAD
  // --------------------------------------------------

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    await Promise.all([
      fetchArticles(),
      fetchMovies(),
    ]);

    setLoading(false);
  }

  // --------------------------------------------------
  // FETCH ARTICLES
  // --------------------------------------------------

  async function fetchArticles() {
    const { data, error } = await supabase
      .from("jmi_news_articles")
      .select(`
        id,
        slug,
        article_type,
        title,
        excerpt,
        thumbnail_url,
        article_content,
        movie_id,
        status,
        published_at,
        created_at,
        updated_at
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "News articles fetch error:",
        error
      );

      setArticles([]);
      return;
    }

    setArticles(data || []);
  }

  // --------------------------------------------------
  // FETCH MOVIES
  // --------------------------------------------------

  async function fetchMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("id, title")
      .order("title", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Movies fetch error:",
        error
      );

      setMovies([]);
      return;
    }

    setMovies(data || []);
  }

  // --------------------------------------------------
  // SLUGIFY
  // --------------------------------------------------

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // --------------------------------------------------
  // MOVIE NAME
  // --------------------------------------------------

  function getMovieTitle(
    currentMovieId: number | null
  ) {
    if (!currentMovieId) {
      return "—";
    }

    const movie = movies.find(
      (item) => item.id === currentMovieId
    );

    return movie?.title ?? "Unknown Movie";
  }

  // --------------------------------------------------
  // ADD IMAGE
  // --------------------------------------------------

  function addArticleImage() {
    setArticleImages((current) => [
      ...current,
      {
        image_url: "",
        caption: "",
        sort_order: current.length,
      },
    ]);
  }

  // --------------------------------------------------
  // UPDATE IMAGE
  // --------------------------------------------------

  function updateArticleImage(
    index: number,
    field: "image_url" | "caption",
    value: string
  ) {
    setArticleImages((current) =>
      current.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              [field]: value,
            }
          : image
      )
    );
  }

  // --------------------------------------------------
  // REMOVE IMAGE
  // --------------------------------------------------

  function removeArticleImage(
    index: number
  ) {
    setArticleImages((current) =>
      current
        .filter(
          (_, imageIndex) =>
            imageIndex !== index
        )
        .map((image, imageIndex) => ({
          ...image,
          sort_order: imageIndex,
        }))
    );
  }

  // --------------------------------------------------
  // CLEAR FORM
  // --------------------------------------------------

  function clearForm() {
    setArticleType("Exclusive Updates");
    setTitle("");
    setExcerpt("");
    setThumbnailUrl("");
    setMovieId("");
    setArticleContent("");
    setStatus("draft");
    setArticleImages([]);
    setEditingArticle(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  async function editArticle(
    article: NewsArticle
  ) {
    setEditingArticle(article);

    setArticleType(article.article_type);
    setTitle(article.title);
    setExcerpt(article.excerpt ?? "");
    setThumbnailUrl(
      article.thumbnail_url ?? ""
    );
    setMovieId(
      article.movie_id
        ? String(article.movie_id)
        : ""
    );
    setArticleContent(article.article_content);
    setStatus(article.status);

    const { data, error } = await supabase
      .from("jmi_news_article_images")
      .select(`
        id,
        image_url,
        caption,
        sort_order
      `)
      .eq("article_id", article.id)
      .order("sort_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Article images fetch error:",
        error
      );

      setArticleImages([]);
    } else {
      setArticleImages(
        (data || []).map((image) => ({
          id: image.id,
          image_url: image.image_url,
          caption: image.caption ?? "",
          sort_order: image.sort_order,
        }))
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // --------------------------------------------------
  // SAVE ARTICLE
  // --------------------------------------------------

  async function saveArticle() {
    if (!title.trim()) {
      alert("Please enter the article title.");
      return;
    }

    if (!articleContent.trim()) {
      alert(
        "Please enter the full article content."
      );
      return;
    }

    if (!articleType) {
      alert("Please select an article type.");
      return;
    }

    if (
      status === "published" &&
      !thumbnailUrl.trim()
    ) {
      alert(
        "Please add a thumbnail before publishing."
      );
      return;
    }

    setSaving(true);

    const slug = slugify(title);

    const publishedAt =
      status === "published"
        ? editingArticle?.published_at ??
          new Date().toISOString()
        : null;

    const articleData = {
      slug,
      article_type: articleType,
      title: title.trim(),
      excerpt:
        excerpt.trim() || null,
      thumbnail_url:
        thumbnailUrl.trim() || null,
      article_content:
        articleContent.trim(),
      movie_id:
        movieId === ""
          ? null
          : Number(movieId),
      status,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    let savedArticleId: number | null = null;

    // --------------------------------------------------
    // UPDATE
    // --------------------------------------------------

    if (editingArticle) {
      const { data, error } = await supabase
        .from("jmi_news_articles")
        .update(articleData)
        .eq("id", editingArticle.id)
        .select("id")
        .single();

      if (error) {
        console.error(
          "News article update error:",
          error
        );

        alert(
          "Failed to update article: " +
            error.message
        );

        setSaving(false);
        return;
      }

      savedArticleId = data.id;

      // Remove existing image records.
      const { error: deleteImagesError } =
        await supabase
          .from("jmi_news_article_images")
          .delete()
          .eq(
            "article_id",
            editingArticle.id
          );

      if (deleteImagesError) {
        console.error(
          "Existing images delete error:",
          deleteImagesError
        );

        alert(
          "Article updated, but old images could not be replaced: " +
            deleteImagesError.message
        );

        setSaving(false);
        return;
      }
    }

    // --------------------------------------------------
    // INSERT
    // --------------------------------------------------

    else {
      const { data, error } = await supabase
        .from("jmi_news_articles")
        .insert(articleData)
        .select("id")
        .single();

      if (error) {
        console.error(
          "News article insert error:",
          error
        );

        alert(
          "Failed to save article: " +
            error.message
        );

        setSaving(false);
        return;
      }

      savedArticleId = data.id;
    }

    // --------------------------------------------------
    // SAVE IMAGES
    // --------------------------------------------------

    if (
      savedArticleId &&
      articleImages.length > 0
    ) {
      const validImages =
        articleImages
          .filter(
            (image) =>
              image.image_url.trim()
          )
          .map(
            (image, index) => ({
              article_id:
                savedArticleId,
              image_url:
                image.image_url.trim(),
              caption:
                image.caption.trim() ||
                null,
              sort_order: index,
            })
          );

      if (validImages.length > 0) {
        const { error } =
          await supabase
            .from(
              "jmi_news_article_images"
            )
            .insert(validImages);

        if (error) {
          console.error(
            "Article images insert error:",
            error
          );

          alert(
            "Article saved, but some article images could not be saved: " +
              error.message
          );
        }
      }
    }

    alert(
      editingArticle
        ? "JMI Exclusive News article updated successfully! 🔥"
        : status === "published"
        ? "JMI Exclusive News article published successfully! 📰🔥"
        : "JMI Exclusive News article saved as draft! 📝"
    );

    await fetchArticles();

    clearForm();

    setSaving(false);
  }

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  async function deleteArticle(
    articleId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this JMI Exclusive News article? This will also delete its article images."
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("jmi_news_articles")
      .delete()
      .eq("id", articleId);

    if (error) {
      console.error(
        "News article delete error:",
        error
      );

      alert(
        "Failed to delete article: " +
          error.message
      );

      return;
    }

    alert(
      "JMI Exclusive News article deleted successfully."
    );

    await fetchArticles();

    if (
      editingArticle?.id === articleId
    ) {
      clearForm();
    }
  }

  // --------------------------------------------------
  // STATUS LABEL
  // --------------------------------------------------

  function statusLabel(
    value: string
  ) {
    return value
      .charAt(0)
      .toUpperCase() +
      value.slice(1);
  }

  // --------------------------------------------------
  // FORMAT DATE
  // --------------------------------------------------

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // --------------------------------------------------
  // STATS
  // --------------------------------------------------

  const publishedCount = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.status ===
          "published"
      ).length,
    [articles]
  );

  const draftCount = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.status === "draft"
      ).length,
    [articles]
  );

  const archivedCount = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.status ===
          "archived"
      ).length,
    [articles]
  );

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-zinc-300">

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8">

          <p className="text-lg">
            Loading JMI Exclusive News...
          </p>

        </div>

      </div>
    );
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-black p-6 text-white">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-yellow-400">
          JMI Exclusive News
        </h1>

        <p className="mt-2 text-base text-zinc-400">
          Create, publish and manage exclusive
          JMI editorial content.
        </p>

      </div>

      {/* OVERVIEW */}

      <div className="mb-8">

        <h2 className="mb-4 text-xl font-bold">
          News Overview
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-base text-zinc-400">
              Total Articles
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {articles.length}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-base text-zinc-400">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {publishedCount}
            </p>

          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

            <p className="text-base text-zinc-400">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {draftCount}
            </p>

          </div>

        </div>

        {archivedCount > 0 && (
          <p className="mt-3 text-sm text-zinc-500">
            Archived articles:{" "}
            {archivedCount}
          </p>
        )}

      </div>

      {/* ARTICLE FORM */}

      <div className="mb-8 rounded-xl border border-yellow-500/30 bg-zinc-950 p-6">

        <div className="mb-6">

          <h2 className="text-2xl font-bold text-yellow-400">
            {editingArticle
              ? "Update Article"
              : "Create New Article"}
          </h2>

          <p className="mt-2 text-base text-zinc-400">
            Add the finalized article content,
            thumbnail and supporting images.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* ARTICLE TYPE */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Article Type
            </label>

            <select
              value={articleType}
              onChange={(e) =>
                setArticleType(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            >

              {ARTICLE_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

          </div>

          {/* STATUS */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Publication Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            >

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {statusLabel(
                      option
                    )}
                  </option>
                )
              )}

            </select>

          </div>

          {/* TITLE */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-base text-zinc-400">
              Main Title / Heading
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Enter the main article title"
              maxLength={250}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            />

            <p className="mt-1 text-xs text-zinc-600">
              URL slug will be generated
              automatically from the title.
            </p>

          </div>

          {/* EXCERPT */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-base text-zinc-400">
              Short Description / Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(
                  e.target.value
                )
              }
              placeholder="A short description used for news cards and previews."
              maxLength={500}
              rows={3}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            />

            <p className="mt-1 text-xs text-zinc-600">
              Keep this concise. It will be
              useful on the public news listing
              and homepage.
            </p>

          </div>

          {/* THUMBNAIL */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Thumbnail Image URL
            </label>

            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) =>
                setThumbnailUrl(
                  e.target.value
                )
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            />

          </div>

          {/* RELATED MOVIE */}

          <div>

            <label className="mb-2 block text-base text-zinc-400">
              Related Movie
            </label>

            <select
              value={movieId}
              onChange={(e) =>
                setMovieId(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
            >

              <option value="">
                No Related Movie
              </option>

              {movies.map((movie) => (
                <option
                  key={movie.id}
                  value={movie.id}
                >
                  {movie.title}
                </option>
              ))}

            </select>

          </div>

          {/* ARTICLE CONTENT */}

          <div className="md:col-span-2">

            <label className="mb-2 block text-base text-zinc-400">
              Full Article Content
            </label>

            <textarea
              value={articleContent}
              onChange={(e) =>
                setArticleContent(
                  e.target.value
                )
              }
              placeholder="Paste your finalized article here..."
              rows={18}
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-4 text-base leading-7 text-white"
            />

            <p className="mt-1 text-xs text-zinc-600">
              You can prepare the article using
              ChatGPT, Gemini or your own writing,
              then paste the finalized version here.
            </p>

          </div>

        </div>

        {/* ARTICLE IMAGES */}

        <div className="mt-8 border-t border-zinc-800 pt-6">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-xl font-bold text-white">
                Article Images
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Add supporting images and optional
                captions.
              </p>

            </div>

            <button
              type="button"
              onClick={addArticleImage}
              className="rounded-lg bg-zinc-800 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700"
            >
              + Add Image
            </button>

          </div>

          {articleImages.length === 0 ? (

            <div className="rounded-lg border border-dashed border-zinc-700 p-6 text-center text-sm text-zinc-500">
              No article images added yet.
            </div>

          ) : (

            <div className="space-y-4">

              {articleImages.map(
                (image, index) => (

                  <div
                    key={
                      image.id ??
                      `new-${index}`
                    }
                    className="rounded-xl border border-zinc-800 bg-black p-5"
                  >

                    <div className="mb-4 flex items-center justify-between">

                      <h4 className="text-base font-semibold text-zinc-200">
                        Image {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          removeArticleImage(
                            index
                          )
                        }
                        className="rounded-lg bg-red-900/60 px-3 py-2 text-xs text-red-200 hover:bg-red-800"
                      >
                        Remove
                      </button>

                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                          Image URL
                        </label>

                        <input
                          type="url"
                          value={
                            image.image_url
                          }
                          onChange={(e) =>
                            updateArticleImage(
                              index,
                              "image_url",
                              e.target.value
                            )
                          }
                          placeholder="https://..."
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                          Caption
                        </label>

                        <input
                          type="text"
                          value={
                            image.caption
                          }
                          onChange={(e) =>
                            updateArticleImage(
                              index,
                              "caption",
                              e.target.value
                            )
                          }
                          placeholder="Optional image caption"
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-base text-white"
                        />

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={saveArticle}
            disabled={saving}
            className="rounded-lg bg-yellow-500 px-8 py-3.5 text-base font-bold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingArticle
              ? "Update Article"
              : status ===
                "published"
              ? "Publish Article"
              : "Save Article"}
          </button>

          {editingArticle && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-lg bg-zinc-800 px-8 py-3.5 text-base text-white hover:bg-zinc-700"
            >
              Cancel Edit
            </button>
          )}

        </div>

      </div>

      {/* ARTICLES TABLE */}

      <div className="rounded-xl border border-zinc-700 bg-black">

        <div className="border-b border-zinc-700 p-6">

          <h2 className="text-2xl font-bold">
            All JMI Exclusive News
          </h2>

          <p className="mt-2 text-base text-zinc-400">
            Manage drafts, published articles
            and archived editorial content.
          </p>

        </div>

        {articles.length === 0 ? (

          <div className="p-10 text-center text-base text-zinc-500">
            No JMI Exclusive News articles
            available yet.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Article
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Related Movie
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Published
                  </th>

                  <th className="px-5 py-4 text-left text-sm text-zinc-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {articles.map(
                  (article) => (

                    <tr
                      key={article.id}
                      className="border-t border-zinc-800 hover:bg-zinc-900/50"
                    >

                      <td className="max-w-md px-5 py-5">

                        <p className="font-semibold text-white">
                          {article.title}
                        </p>

                        {article.excerpt && (
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                            {article.excerpt}
                          </p>
                        )}

                      </td>

                      <td className="px-5 py-5 text-sm text-zinc-300">
                        {article.article_type}
                      </td>

                      <td className="px-5 py-5 text-sm text-zinc-400">
                        {getMovieTitle(
                          article.movie_id
                        )}
                      </td>

                      <td className="px-5 py-5">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            article.status ===
                            "published"
                              ? "bg-green-900/40 text-green-300"
                              : article.status ===
                                "archived"
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-yellow-900/40 text-yellow-300"
                          }`}
                        >
                          {statusLabel(
                            article.status
                          )}
                        </span>

                      </td>

                      <td className="px-5 py-5 text-sm text-zinc-400">
                        {formatDate(
                          article.published_at
                        )}
                      </td>

                      <td className="px-5 py-5">

                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              editArticle(
                                article
                              )
                            }
                            className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteArticle(
                                article.id
                              )
                            }
                            className="rounded-lg bg-red-900/60 px-4 py-2 text-sm text-red-200 hover:bg-red-800"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}