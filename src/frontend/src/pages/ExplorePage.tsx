import { Play, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["All", "Videos", "Creators", "Live"];

const TRENDING_CONTENT = [
  {
    id: 1,
    title: "Interstellar: 4K Director's Cut",
    image: "https://picsum.photos/seed/movie1/200/300",
    genre: "Sci-Fi",
    views: "12M",
  },
  {
    id: 2,
    title: "Tokyo Night Life Documentary",
    image: "https://picsum.photos/seed/movie2/200/300",
    genre: "Documentary",
    views: "8.4M",
  },
  {
    id: 3,
    title: "Ocean Depths: Unseen World",
    image: "https://picsum.photos/seed/movie3/200/300",
    genre: "Nature",
    views: "6.1M",
  },
  {
    id: 4,
    title: "Street Art Masters S3",
    image: "https://picsum.photos/seed/movie4/200/300",
    genre: "Art",
    views: "4.7M",
  },
  {
    id: 5,
    title: "Quantum Computing Explained",
    image: "https://picsum.photos/seed/movie5/200/300",
    genre: "Tech",
    views: "3.2M",
  },
  {
    id: 6,
    title: "Midnight in Marrakech",
    image: "https://picsum.photos/seed/movie6/200/300",
    genre: "Travel",
    views: "5.8M",
  },
];

const TOP_VIDEOS = [
  {
    id: 1,
    thumbnail: "https://picsum.photos/seed/vid1/300/200",
    title: "How I got 10M followers in 6 months",
    views: "9.2M",
    duration: "12:34",
  },
  {
    id: 2,
    thumbnail: "https://picsum.photos/seed/vid2/300/200",
    title: "Coding my dream app in 24 hours",
    views: "4.5M",
    duration: "24:18",
  },
  {
    id: 3,
    thumbnail: "https://picsum.photos/seed/vid3/300/200",
    title: "Perfect ramen from scratch",
    views: "7.1M",
    duration: "15:42",
  },
  {
    id: 4,
    thumbnail: "https://picsum.photos/seed/vid4/300/200",
    title: "Exploring abandoned cities",
    views: "3.8M",
    duration: "31:05",
  },
  {
    id: 5,
    thumbnail: "https://picsum.photos/seed/vid5/300/200",
    title: "AI art generation masterclass",
    views: "6.3M",
    duration: "42:10",
  },
  {
    id: 6,
    thumbnail: "https://picsum.photos/seed/vid6/300/200",
    title: "Zero-gravity photography tips",
    views: "2.9M",
    duration: "18:22",
  },
];

const TOP_CREATORS = [
  {
    id: 1,
    name: "Leo Martinez",
    followers: "4.2M",
    avatar: "https://picsum.photos/seed/user1/60/60",
    category: "Travel",
  },
  {
    id: 2,
    name: "Sarah Kim",
    followers: "3.8M",
    avatar: "https://picsum.photos/seed/user2/60/60",
    category: "Lifestyle",
  },
  {
    id: 3,
    name: "Julia Arts",
    followers: "5.1M",
    avatar: "https://picsum.photos/seed/user3/60/60",
    category: "Art",
  },
  {
    id: 4,
    name: "Max Chen",
    followers: "2.4M",
    avatar: "https://picsum.photos/seed/user4/60/60",
    category: "Tech",
  },
  {
    id: 5,
    name: "Priya Sharma",
    followers: "6.7M",
    avatar: "https://picsum.photos/seed/user5/60/60",
    category: "Culture",
  },
  {
    id: 6,
    name: "Alex Nova",
    followers: "3.2M",
    avatar: "https://picsum.photos/seed/user6/60/60",
    category: "Science",
  },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [followedCreators, setFollowedCreators] = useState<Set<number>>(
    new Set(),
  );

  const toggleFollow = (id: number) => {
    setFollowedCreators((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
        {/* Trending Now */}
        <section data-ocid="explore.trending.section">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: "#FF4DA6" }} />
            <h2 className="text-white font-bold">Trending Now</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {TRENDING_CONTENT.map((item, idx) => (
              <div
                key={item.id}
                className="relative flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer"
                data-ocid={`explore.trending.item.${idx + 1}`}
              >
                <img
                  src={item.image}
                  alt={item.title}
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
                    {item.genre}
                  </span>
                  <p className="text-white text-xs mt-1 font-medium leading-tight line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {item.views} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Videos */}
        <section data-ocid="explore.videos.section">
          <h2 className="text-white font-bold mb-3">Top Videos</h2>
          <div className="grid grid-cols-2 gap-3">
            {TOP_VIDEOS.map((video, idx) => (
              <div
                key={video.id}
                className="relative rounded-xl overflow-hidden cursor-pointer"
                data-ocid={`explore.video.item.${idx + 1}`}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover block"
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
                {/* Duration */}
                <div className="absolute top-2 right-2">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(0,0,0,0.7)", color: "white" }}
                  >
                    {video.duration}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-medium line-clamp-2">
                    {video.title}
                  </p>
                  <p className="text-white/50 text-xs">{video.views} views</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Creators */}
        <section data-ocid="explore.creators.section">
          <h2 className="text-white font-bold mb-3">Top Creators</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {TOP_CREATORS.map((creator, idx) => (
              <div
                key={creator.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl w-32"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                data-ocid={`explore.creator.item.${idx + 1}`}
              >
                <div className="gradient-ring">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover block"
                    style={{ border: "2px solid #0B0C10" }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-white text-xs font-semibold truncate w-24">
                    {creator.name}
                  </p>
                  <p className="text-white/40 text-xs">{creator.followers}</p>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                    style={{
                      background: "rgba(122,92,255,0.2)",
                      color: "#7A5CFF",
                    }}
                  >
                    {creator.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFollow(creator.id)}
                  className="text-xs font-medium px-3 py-1 rounded-full transition-all duration-200"
                  style={{
                    background: followedCreators.has(creator.id)
                      ? "rgba(255,255,255,0.1)"
                      : "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                    color: "white",
                  }}
                  data-ocid={`explore.creator.follow.${idx + 1}`}
                >
                  {followedCreators.has(creator.id) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
