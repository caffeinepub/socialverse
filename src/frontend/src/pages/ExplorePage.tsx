import { useMutation, useQuery } from "@tanstack/react-query";
import { Play, Search, TrendingUp, UserCheck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useBackend } from "../hooks/useBackend";
import type { Post, UserProfile } from "../types";
import { MediaType } from "../types";

const CATEGORIES = ["All", "Videos", "Creators", "Live"];

function formatCount(n: bigint | number): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const { backend, isFetching } = useBackend();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch all posts
  const { data: postsData } = useQuery({
    queryKey: ["explorePosts"],
    queryFn: async () => {
      if (!backend)
        return { items: [] as Post[], hasMore: false, nextOffset: 0n };
      return backend.getPosts(0n, 20n);
    },
    enabled: !!backend && !isFetching,
  });

  const allPosts = postsData?.items ?? [];

  // Trending = photo posts sorted by likeCount
  const trendingPosts = [...allPosts]
    .sort((a, b) => Number(b.likeCount) - Number(a.likeCount))
    .slice(0, 6);

  // Video posts
  const videoPosts = allPosts
    .filter((p) => p.mediaType === MediaType.video)
    .slice(0, 6);

  // Search users
  const { data: searchResults = [] } = useQuery<UserProfile[]>({
    queryKey: ["searchUsers", debouncedSearch],
    queryFn: async () => {
      if (!backend || !debouncedSearch.trim()) return [];
      return backend.searchUsers(debouncedSearch.trim());
    },
    enabled: !!backend && !isFetching && debouncedSearch.trim().length > 0,
  });

  // Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: async ({
      targetId,
      isFollowing,
    }: {
      targetId: UserProfile["id"];
      isFollowing: boolean;
    }) => {
      if (!backend) throw new Error("Backend not ready");
      if (isFollowing) return backend.unfollowUser(targetId);
      return backend.followUser(targetId);
    },
    onMutate: ({ targetId, isFollowing }) => {
      const key = targetId.toString();
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    onError: (_err, { targetId, isFollowing }) => {
      // Revert optimistic update
      const key = targetId.toString();
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (isFollowing) next.add(key);
        else next.delete(key);
        return next;
      });
    },
  });

  const showSearch = debouncedSearch.trim().length > 0;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="explore.page"
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 py-3"
        style={{ backgroundColor: "#0B0C10" }}
      >
        <h1 className="text-xl font-bold text-white mb-3">Explore</h1>
        {/* Search bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-3"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search creators, videos, trends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
            data-ocid="explore.search_input"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activeCategory === cat
                    ? "linear-gradient(90deg, #7A5CFF, #FF4DA6)"
                    : "rgba(255,255,255,0.07)",
                color:
                  activeCategory === cat ? "white" : "rgba(255,255,255,0.6)",
                border:
                  activeCategory === cat
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
              data-ocid={`explore.${cat.toLowerCase()}.tab`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-8 pb-4">
        {/* Search Results */}
        {showSearch && (
          <section data-ocid="explore.search.results">
            <h2 className="text-white font-bold mb-3">Search Results</h2>
            {searchResults.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                No users found for &ldquo;{debouncedSearch}&rdquo;
              </p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((user, idx) => {
                  const key = user.id.toString();
                  const isFollowing = followedIds.has(key);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      data-ocid={`explore.search.user.${idx + 1}`}
                    >
                      <div className="gradient-ring">
                        {user.avatarMediaId ? (
                          <img
                            src={user.avatarMediaId.getDirectURL()}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover block"
                            style={{ border: "2px solid #0B0C10" }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
                              border: "2px solid #0B0C10",
                            }}
                          >
                            <span className="text-white text-sm font-bold">
                              {user.displayName[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {user.displayName}
                        </p>
                        <p className="text-white/40 text-xs">
                          @{user.username} · {formatCount(user.followerCount)}{" "}
                          followers
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          followMutation.mutate({
                            targetId: user.id,
                            isFollowing,
                          })
                        }
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                        style={{
                          background: isFollowing
                            ? "rgba(255,255,255,0.1)"
                            : "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                          color: "white",
                        }}
                        data-ocid={`explore.search.follow.${idx + 1}`}
                      >
                        {isFollowing ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Trending Now */}
        {!showSearch && (
          <section data-ocid="explore.trending.section">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" style={{ color: "#FF4DA6" }} />
              <h2 className="text-white font-bold">Trending Now</h2>
            </div>
            {trendingPosts.length === 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {["t1", "t2", "t3", "t4"].map((key) => (
                  <div
                    key={key}
                    className="flex-shrink-0 w-36 h-52 rounded-xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {trendingPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="relative flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer"
                    data-ocid={`explore.trending.item.${idx + 1}`}
                  >
                    <img
                      src={post.mediaId.getDirectURL()}
                      alt={post.caption || `Post by @${post.authorUsername}`}
                      className="w-36 h-52 object-cover block"
                    />
                    {/* Overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
                      }}
                    />
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: "rgba(122,92,255,0.7)",
                          color: "white",
                        }}
                      >
                        @{post.authorUsername}
                      </span>
                      <p className="text-white text-xs mt-1 font-medium leading-tight line-clamp-2">
                        {post.caption || "Untitled"}
                      </p>
                      <p className="text-white/50 text-xs mt-0.5">
                        {formatCount(post.likeCount)} likes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Top Videos */}
        {!showSearch && (
          <section data-ocid="explore.videos.section">
            <h2 className="text-white font-bold mb-3">Top Videos</h2>
            {videoPosts.length === 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {["v1", "v2", "v3", "v4"].map((key) => (
                  <div
                    key={key}
                    className="rounded-xl aspect-video animate-pulse"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {videoPosts.map((video, idx) => (
                  <div
                    key={video.id}
                    className="relative rounded-xl overflow-hidden cursor-pointer"
                    data-ocid={`explore.video.item.${idx + 1}`}
                  >
                    <video
                      src={video.mediaId.getDirectURL()}
                      className="w-full aspect-video object-cover block"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    {/* Gradient */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
                      }}
                    />
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <Play
                          className="w-5 h-5 text-white"
                          style={{ fill: "white" }}
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {video.caption || "Untitled"}
                      </p>
                      <p className="text-white/50 text-xs">
                        {formatCount(video.likeCount)} likes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Top Creators (derived from post authors) */}
        {!showSearch && (
          <section data-ocid="explore.creators.section">
            <h2 className="text-white font-bold mb-3">Top Creators</h2>
            {allPosts.length === 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {["c1", "c2", "c3", "c4"].map((key) => (
                  <div
                    key={key}
                    className="flex-shrink-0 w-32 h-40 rounded-2xl animate-pulse"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {/* Deduplicate by authorId to show unique creators */}
                {Array.from(
                  new Map(
                    allPosts.map((p) => [
                      p.authorId.toString(),
                      {
                        id: p.authorId,
                        username: p.authorUsername,
                        postCount: allPosts.filter(
                          (q) =>
                            q.authorId.toString() === p.authorId.toString(),
                        ).length,
                      },
                    ]),
                  ).values(),
                )
                  .sort((a, b) => b.postCount - a.postCount)
                  .slice(0, 8)
                  .map((creator, idx) => {
                    const key = creator.id.toString();
                    const isFollowing = followedIds.has(key);
                    return (
                      <div
                        key={key}
                        className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl w-32"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        data-ocid={`explore.creator.item.${idx + 1}`}
                      >
                        <div className="gradient-ring">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                              background:
                                "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
                              border: "2px solid #0B0C10",
                            }}
                          >
                            <span className="text-white text-sm font-bold">
                              {creator.username[0]?.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-white text-xs font-semibold truncate w-24">
                            @{creator.username}
                          </p>
                          <p className="text-white/40 text-xs">
                            {creator.postCount} posts
                          </p>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                            style={{
                              background: "rgba(122,92,255,0.2)",
                              color: "#7A5CFF",
                            }}
                          >
                            Creator
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            followMutation.mutate({
                              targetId: creator.id,
                              isFollowing,
                            })
                          }
                          className="text-xs font-medium px-3 py-1 rounded-full transition-all duration-200"
                          style={{
                            background: isFollowing
                              ? "rgba(255,255,255,0.1)"
                              : "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                            color: "white",
                          }}
                          data-ocid={`explore.creator.follow.${idx + 1}`}
                        >
                          {isFollowing ? "Following" : "Follow"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
