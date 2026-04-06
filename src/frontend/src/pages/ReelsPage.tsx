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
import { useEffect, useState } from "react";

const MOCK_REELS = [
  {
    id: 1,
    image: "https://picsum.photos/seed/reel1/400/700",
    creator: {
      name: "Leo Martinez",
      avatar: "https://picsum.photos/seed/user1/60/60",
    },
    caption: "Epic mountain sunrise \uD83C\uDFD4\uFE0F 6000m above sea level",
    music: "Altitude - Arctic Monkeys",
    likes: 18420,
    comments: 934,
    views: "2.1M",
  },
  {
    id: 2,
    image: "https://picsum.photos/seed/reel2/400/700",
    creator: {
      name: "Sarah Kim",
      avatar: "https://picsum.photos/seed/user2/60/60",
    },
    caption: "Underwater world is absolutely magical \uD83C\uDF0A #scuba",
    music: "Ocean Eyes - Billie Eilish",
    likes: 24810,
    comments: 1204,
    views: "3.4M",
  },
  {
    id: 3,
    image: "https://picsum.photos/seed/reel3/400/700",
    creator: {
      name: "Julia Arts",
      avatar: "https://picsum.photos/seed/user3/60/60",
    },
    caption: "Watch me paint a whole galaxy in 60 seconds \uD83C\uDFA8\u2728",
    music: "Starboy - The Weeknd",
    likes: 31042,
    comments: 2103,
    views: "4.7M",
  },
  {
    id: 4,
    image: "https://picsum.photos/seed/reel4/400/700",
    creator: {
      name: "Max Chen",
      avatar: "https://picsum.photos/seed/user4/60/60",
    },
    caption: "Building a mechanical keyboard from scratch \uD83D\uDCBB\u26A1",
    music: "Hacker - Death Grips",
    likes: 9821,
    comments: 567,
    views: "1.2M",
  },
  {
    id: 5,
    image: "https://picsum.photos/seed/reel5/400/700",
    creator: {
      name: "Priya Sharma",
      avatar: "https://picsum.photos/seed/user5/60/60",
    },
    caption: "Diwali lights from above - drone view \uD83E\uDE94\u2728",
    music: "Rang De Basanti - A.R. Rahman",
    likes: 52300,
    comments: 4210,
    views: "8.9M",
  },
  {
    id: 6,
    image: "https://picsum.photos/seed/reel6/400/700",
    creator: {
      name: "Alex Nova",
      avatar: "https://picsum.photos/seed/user6/60/60",
    },
    caption: "Milky Way from the Atacama Desert \uD83C\uDF0C No filters!",
    music: "Cosmic Love - Florence",
    likes: 41200,
    comments: 3100,
    views: "6.2M",
  },
];

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
  const [currentReel, setCurrentReel] = useState(0);
  const [likedReels, setLikedReels] = useState<Set<number>>(new Set());
  const [savedReels, setSavedReels] = useState<Set<number>>(new Set());

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setCurrentReel((prev) => Math.min(prev + 1, MOCK_REELS.length - 1));
    } else {
      setCurrentReel((prev) => Math.max(prev - 1, 0));
    }
  };

  const reel = MOCK_REELS[currentReel];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown")
        setCurrentReel((p) => Math.min(p + 1, MOCK_REELS.length - 1));
      if (e.key === "ArrowUp") setCurrentReel((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#000", fontFamily: "Inter, sans-serif" }}
      onWheel={handleWheel}
      data-ocid="reels.page"
    >
      {/* Reel image */}
      <img
        key={reel.id}
        src={reel.image}
        alt="Reel"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transition: "opacity 0.3s ease" }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)",
        }}
      />

      {/* Top overlay: view count */}
      <div className="absolute top-14 left-0 right-0 flex justify-center z-20">
        <div
          className="px-3 py-1 rounded-full text-white/70 text-xs"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {reel.views} views
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
            setCurrentReel((p) => Math.min(p + 1, MOCK_REELS.length - 1))
          }
          disabled={currentReel === MOCK_REELS.length - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: "rgba(255,255,255,0.15)",
            opacity: currentReel === MOCK_REELS.length - 1 ? 0.3 : 1,
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
          onClick={() =>
            setLikedReels((prev) => {
              const next = new Set(prev);
              if (next.has(reel.id)) next.delete(reel.id);
              else next.add(reel.id);
              return next;
            })
          }
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
                color: likedReels.has(reel.id) ? "#FF4DA6" : "white",
                fill: likedReels.has(reel.id) ? "#FF4DA6" : "transparent",
              }}
            />
          </div>
          <span className="text-white text-xs">
            {((reel.likes + (likedReels.has(reel.id) ? 1 : 0)) / 1000).toFixed(
              1,
            )}
            K
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
            {(reel.comments / 1000).toFixed(1)}K
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
          onClick={() => handleDownload(reel.image, `reel-${reel.id}.jpg`)}
          className="flex flex-col items-center gap-1"
          data-ocid="reels.download.button"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <Download className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs">Save</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-24 left-4 right-20 z-20">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={reel.creator.avatar}
            alt={reel.creator.name}
            className="w-10 h-10 rounded-full object-cover"
            style={{ border: "2px solid white" }}
          />
          <div>
            <p className="text-white font-semibold text-sm">
              {reel.creator.name}
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
          <p className="text-white/70 text-xs truncate">{reel.music}</p>
        </div>
      </div>

      {/* Reel indicator dots */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        {MOCK_REELS.map((reelItem, i) => (
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
