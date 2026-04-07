import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Bookmark,
  Download,
  Heart,
  MessageCircle,
  MessageSquare,
  Search,
  Share2,
} from "lucide-react";
import { useState } from "react";
import { useBackend } from "../hooks/useBackend";
import { MediaType } from "../types";

const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
};

function GradientAvatar({ username }: { username: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
      style={{ background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)" }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

function GradientAvatarLg({ username }: { username: string }) {
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base"
      style={{ background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)" }}
    >
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

export default function HomePage() {
  const { backend, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [animatingLike, setAnimatingLike] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState<
    Map<string, { liked: boolean; delta: number }>
  >(new Map());

  const { data: postsResult, isLoading: postsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!backend) return { items: [], nextOffset: BigInt(0), hasMore: false };
      return backend.getPosts(BigInt(0), BigInt(20));
    },
    enabled: !!backend && !isFetching,
  });

  const posts = postsResult?.items ?? [];

  // Fetch like status for each post
  const likeStatuses = useQuery({
    queryKey: ["likeStatuses", posts.map((p) => p.id)],
    queryFn: async () => {
      if (!backend || posts.length === 0) return {};
      const results = await Promise.all(
        posts.map(async (p) => ({
          id: p.id,
          liked: await backend.isLiked(p.id),
        })),
      );
      const map: Record<string, boolean> = {};
      for (const r of results) map[r.id] = r.liked;
      return map;
    },
    enabled: !!backend && !isFetching && posts.length > 0,
  });

  const likePostMutation = useMutation({
    mutationFn: async ({
      postId,
      isCurrentlyLiked,
    }: { postId: string; isCurrentlyLiked: boolean }) => {
      if (!backend) throw new Error("No backend");
      if (isCurrentlyLiked) {
        return backend.unlikePost(postId);
      }
      return backend.likePost(postId);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["likeStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setLocalLikes((prev) => {
        const next = new Map(prev);
        next.delete(postId);
        return next;
      });
    },
  });

  const handleLike = (postId: string) => {
    const currentLiked = likeStatuses.data?.[postId] ?? false;
    const localState = localLikes.get(postId);
    const effectiveLiked = localState ? localState.liked : currentLiked;

    setLocalLikes((prev) => {
      const next = new Map(prev);
      next.set(postId, {
        liked: !effectiveLiked,
        delta: effectiveLiked ? -1 : 1,
      });
      return next;
    });
    setAnimatingLike(postId);
    setTimeout(() => setAnimatingLike(null), 400);
    likePostMutation.mutate({ postId, isCurrentlyLiked: effectiveLiked });
  };

  const handleSave = (postId: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // Stories: derive from posts' unique authors
  const storyCreators = Array.from(
    new Map(posts.map((p) => [p.authorId.toString(), p])).values(),
  ).slice(0, 8);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="home.page"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3">
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-2.5"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(11,12,16,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.07)" }}
            data-ocid="home.search_input"
          >
            <Search className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm">Search...</span>
          </button>

          <h1 className="text-lg font-bold gradient-text">SocialVerse</h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
              data-ocid="home.bell.button"
            >
              <Bell className="w-4 h-4 text-white/70" />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
              data-ocid="home.chat.button"
            >
              <MessageSquare className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Stories */}
      <section className="px-4 py-2" data-ocid="home.stories.section">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {/* Add story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              +
            </div>
            <span className="text-white/50 text-xs">Add Story</span>
          </div>

          {storyCreators.length > 0
            ? storyCreators.map((post, idx) => (
                <div
                  key={post.authorId.toString()}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  data-ocid={`home.stories.item.${idx + 1}`}
                >
                  <div className="gradient-ring">
                    <GradientAvatarLg username={post.authorUsername} />
                  </div>
                  <span className="text-white/60 text-xs truncate w-16 text-center">
                    {post.authorUsername.split("_")[0]}
                  </span>
                </div>
              ))
            : !postsLoading &&
              (["a", "b", "c", "d"] as const).map((key) => (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                >
                  <div
                    className="w-16 h-16 rounded-full animate-pulse"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  />
                  <div
                    className="w-10 h-2 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  />
                </div>
              ))}
        </div>
      </section>

      {/* Feed */}
      <section className="px-4 space-y-5 mt-2" data-ocid="home.feed.section">
        {/* Loading skeletons */}
        {postsLoading &&
          (["s1", "s2", "s3"] as const).map((key) => (
            <div
              key={key}
              className="rounded-2xl overflow-hidden animate-pulse"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3 p-3">
                <div
                  className="w-9 h-9 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
                <div className="flex-1 space-y-1">
                  <div
                    className="w-24 h-3 rounded"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                  <div
                    className="w-16 h-2 rounded"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  />
                </div>
              </div>
              <div
                className="w-full aspect-square"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
              <div className="p-3 space-y-2">
                <div
                  className="w-32 h-3 rounded"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>
          ))}

        {/* Empty state */}
        {!postsLoading && posts.length === 0 && (
          <div
            className="rounded-2xl p-8 text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            data-ocid="home.feed.empty"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(122,92,255,0.2), rgba(255,77,166,0.2))",
              }}
            >
              📸
            </div>
            <h3 className="text-white font-bold text-lg mb-2">No posts yet</h3>
            <p className="text-white/50 text-sm mb-4">
              Be the first to share something! Upload a photo or video to get
              started.
            </p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
              }}
            >
              + Upload First Post
            </div>
          </div>
        )}

        {/* Real posts */}
        {posts
          .filter((post) => post.mediaType === MediaType.photo)
          .map((post, idx) => {
            const mediaUrl = post.mediaId.getDirectURL();
            const localState = localLikes.get(post.id);
            const serverLiked = likeStatuses.data?.[post.id] ?? false;
            const isLiked = localState ? localState.liked : serverLiked;
            const baseLikeCount = Number(post.likeCount);
            const displayLikeCount = localState
              ? baseLikeCount + localState.delta
              : baseLikeCount;

            return (
              <article
                key={post.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backdropFilter: "blur(12px)",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                data-ocid={`home.feed.item.${idx + 1}`}
              >
                {/* Post header */}
                <div className="flex items-center gap-3 p-3">
                  <div className="gradient-ring">
                    <GradientAvatar username={post.authorUsername} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {post.authorUsername}
                    </p>
                    <p className="text-white/40 text-xs">
                      @{post.authorUsername.toLowerCase()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-white/40 hover:text-white/70 text-lg"
                  >
                    ···
                  </button>
                </div>

                {/* Post media */}
                <img
                  src={mediaUrl}
                  alt="Post"
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />

                {/* Actions */}
                <div className="p-3 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 transition-transform duration-150 active:scale-90"
                    data-ocid={`home.feed.like.${idx + 1}`}
                  >
                    <Heart
                      className={`w-6 h-6 transition-all duration-200 ${
                        animatingLike === post.id ? "animate-pulse-scale" : ""
                      }`}
                      style={{
                        color: isLiked ? "#FF4DA6" : "rgba(255,255,255,0.7)",
                        fill: isLiked ? "#FF4DA6" : "transparent",
                      }}
                    />
                    <span className="text-white/60 text-sm">
                      {displayLikeCount.toLocaleString()}
                    </span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-1.5"
                    data-ocid={`home.feed.comment.${idx + 1}`}
                  >
                    <MessageCircle className="w-6 h-6 text-white/70" />
                    <span className="text-white/60 text-sm">
                      {Number(post.commentCount).toLocaleString()}
                    </span>
                  </button>

                  <button
                    type="button"
                    data-ocid={`home.feed.share.${idx + 1}`}
                  >
                    <Share2 className="w-6 h-6 text-white/70" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(mediaUrl, `post-${post.id}.jpg`)
                    }
                    data-ocid={`home.feed.download.${idx + 1}`}
                  >
                    <Download className="w-6 h-6 text-white/70" />
                  </button>

                  <button
                    type="button"
                    className="ml-auto"
                    onClick={() => handleSave(post.id)}
                    data-ocid={`home.feed.bookmark.${idx + 1}`}
                  >
                    <Bookmark
                      className="w-6 h-6"
                      style={{
                        color: savedPosts.has(post.id)
                          ? "#7A5CFF"
                          : "rgba(255,255,255,0.7)",
                        fill: savedPosts.has(post.id)
                          ? "#7A5CFF"
                          : "transparent",
                      }}
                    />
                  </button>
                </div>

                {/* Caption */}
                <div className="px-3 pb-3">
                  <p className="text-white/80 text-sm">
                    <span className="font-semibold text-white">
                      {post.authorUsername}
                    </span>{" "}
                    {post.caption}
                  </p>
                </div>
              </article>
            );
          })}
      </section>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-white/20 text-xs">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
