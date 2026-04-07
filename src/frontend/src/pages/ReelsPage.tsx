import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Download,
  Heart,
  MessageCircle,
  Music,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

export default function ReelsPage() {
  const { backend, isFetching } = useBackend();
  const queryClient = useQueryClient();
  const [currentReel, setCurrentReel] = useState(0);
  const [savedReels, setSavedReels] = useState<Set<string>>(new Set());
  const [localLikes, setLocalLikes] = useState<
    Map<string, { liked: boolean; delta: number }>
  >(new Map());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const { data: postsResult, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!backend) return { items: [], nextOffset: BigInt(0), hasMore: false };
      return backend.getPosts(BigInt(0), BigInt(50));
    },
    enabled: !!backend && !isFetching,
  });

  const reels = (postsResult?.items ?? []).filter(
    (p) => p.mediaType === MediaType.video,
  );

  const likeStatuses = useQuery({
    queryKey: ["reelLikeStatuses", reels.map((r) => r.id)],
    queryFn: async () => {
      if (!backend || reels.length === 0) return {};
      const results = await Promise.all(
        reels.map(async (r) => ({
          id: r.id,
          liked: await backend.isLiked(r.id),
        })),
      );
      const map: Record<string, boolean> = {};
      for (const r of results) map[r.id] = r.liked;
      return map;
    },
    enabled: !!backend && !isFetching && reels.length > 0,
  });

  const likePostMutation = useMutation({
    mutationFn: async ({
      postId,
      isCurrentlyLiked,
    }: { postId: string; isCurrentlyLiked: boolean }) => {
      if (!backend) throw new Error("No backend");
      return isCurrentlyLiked
        ? backend.unlikePost(postId)
        : backend.likePost(postId);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["reelLikeStatuses"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setLocalLikes((prev) => {
        const next = new Map(prev);
        next.delete(postId);
        return next;
      });
    },
  });

  const handleLike = (postId: string) => {
    const serverLiked = likeStatuses.data?.[postId] ?? false;
    const localState = localLikes.get(postId);
    const effectiveLiked = localState ? localState.liked : serverLiked;
    setLocalLikes((prev) => {
      const next = new Map(prev);
      next.set(postId, {
        liked: !effectiveLiked,
        delta: effectiveLiked ? -1 : 1,
      });
      return next;
    });
    likePostMutation.mutate({ postId, isCurrentlyLiked: effectiveLiked });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setCurrentReel((prev) => Math.min(prev + 1, reels.length - 1));
    } else {
      setCurrentReel((prev) => Math.max(prev - 1, 0));
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown")
        setCurrentReel((p) => Math.min(p + 1, Math.max(0, reels.length - 1)));
      if (e.key === "ArrowUp") setCurrentReel((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reels.length]);

  // Auto-play the current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((videoEl, postId) => {
      const reelIdx = reels.findIndex((r) => r.id === postId);
      if (reelIdx === currentReel) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    });
  }, [currentReel, reels]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="relative h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: "#000" }}
        data-ocid="reels.page"
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-full animate-spin"
            style={{
              border: "3px solid rgba(122,92,255,0.3)",
              borderTopColor: "#7A5CFF",
            }}
          />
          <span className="text-white/50 text-sm">Loading reels...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && reels.length === 0) {
    return (
      <div
        className="relative h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: "#000" }}
        data-ocid="reels.page"
      >
        <div className="flex flex-col items-center gap-4 px-8 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(122,92,255,0.2), rgba(255,77,166,0.2))",
            }}
          >
            🎬
          </div>
          <h3 className="text-white font-bold text-xl">No Reels Yet</h3>
          <p className="text-white/50 text-sm leading-relaxed">
            Be the first to upload a video reel! Share your moments with the
            world.
          </p>
        </div>
      </div>
    );
  }

  const reel = reels[currentReel];
  if (!reel) return null;

  const mediaUrl = reel.mediaId.getDirectURL();
  const localState = localLikes.get(reel.id);
  const serverLiked = likeStatuses.data?.[reel.id] ?? false;
  const isLiked = localState ? localState.liked : serverLiked;
  const baseLikeCount = Number(reel.likeCount);
  const displayLikeCount = localState
    ? baseLikeCount + localState.delta
    : baseLikeCount;

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#000", fontFamily: "Inter, sans-serif" }}
      onWheel={handleWheel}
      data-ocid="reels.page"
    >
      {/* Reel video */}
      <video
        key={reel.id}
        ref={(el) => {
          if (el) {
            videoRefs.current.set(reel.id, el);
          } else {
            videoRefs.current.delete(reel.id);
          }
        }}
        src={mediaUrl}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transition: "opacity 0.3s ease" }}
        loop
        muted
        playsInline
        autoPlay
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
        }}
      />

      {/* Top overlay */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-20">
        <div
          className="px-3 py-1 rounded-full text-white/70 text-xs"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          🎬 Reel {currentReel + 1} / {reels.length}
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setCurrentReel((p) => Math.max(p - 1, 0))}
          disabled={currentReel === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: "rgba(255,255,255,0.15)",
            opacity: currentReel === 0 ? 0.3 : 1,
          }}
          data-ocid="reels.prev.button"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <button
          type="button"
          onClick={() =>
            setCurrentReel((p) => Math.min(p + 1, reels.length - 1))
          }
          disabled={currentReel === reels.length - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: "rgba(255,255,255,0.15)",
            opacity: currentReel === reels.length - 1 ? 0.3 : 1,
          }}
          data-ocid="reels.next.button"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right actions */}
      <div className="absolute right-4 bottom-36 z-20 flex flex-col gap-5 items-center">
        <button
          type="button"
          onClick={() => handleLike(reel.id)}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.like.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Heart
              className="w-6 h-6"
              style={{
                color: isLiked ? "#FF4DA6" : "white",
                fill: isLiked ? "#FF4DA6" : "transparent",
              }}
            />
          </div>
          <span className="text-white text-xs">
            {formatCount(displayLikeCount)}
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1"
          data-ocid="reels.comment.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">
            {formatCount(Number(reel.commentCount))}
          </span>
        </button>

        <button
          type="button"
          className="flex flex-col items-center gap-1"
          data-ocid="reels.share.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">Share</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setSavedReels((prev) => {
              const next = new Set(prev);
              if (next.has(reel.id)) next.delete(reel.id);
              else next.add(reel.id);
              return next;
            })
          }
          className="flex flex-col items-center gap-1"
          data-ocid="reels.bookmark.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Bookmark
              className="w-6 h-6"
              style={{
                color: savedReels.has(reel.id) ? "#7A5CFF" : "white",
                fill: savedReels.has(reel.id) ? "#7A5CFF" : "transparent",
              }}
            />
          </div>
          <span className="text-white text-xs">Save</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownload(mediaUrl, `reel-${reel.id}.mp4`)}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.download.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Download className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">Download</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-24 left-4 right-20 z-20">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
              border: "2px solid white",
            }}
          >
            {reel.authorUsername.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {reel.authorUsername}
            </p>
            <button
              type="button"
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ border: "1px solid white", color: "white" }}
            >
              Follow
            </button>
          </div>
        </div>
        <p className="text-white/90 text-sm mb-2">{reel.caption}</p>
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)" }}
          >
            <Music className="w-3 h-3 text-white" />
          </div>
          <p className="text-white/70 text-xs truncate">SocialVerse Original</p>
        </div>
      </div>

      {/* Reel indicator dots */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {reels.map((reelItem, i) => (
          <button
            type="button"
            key={reelItem.id}
            onClick={() => setCurrentReel(i)}
            className="transition-all duration-200"
          >
            <div
              className="rounded-full"
              style={{
                width: i === currentReel ? 4 : 3,
                height: i === currentReel ? 20 : 6,
                background:
                  i === currentReel ? "white" : "rgba(255,255,255,0.3)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
