import {
  Bell,
  Bookmark,
  Heart,
  MessageCircle,
  MessageSquare,
  Search,
  Share2,
} from "lucide-react";
import { useState } from "react";

const MOCK_USERS = [
  {
    id: 1,
    name: "Leo Martinez",
    username: "@travel_leo",
    avatar: "https://picsum.photos/seed/user1/60/60",
  },
  {
    id: 2,
    name: "Sarah Kim",
    username: "@sarah_k",
    avatar: "https://picsum.photos/seed/user2/60/60",
  },
  {
    id: 3,
    name: "Julia Arts",
    username: "@artistry_julia",
    avatar: "https://picsum.photos/seed/user3/60/60",
  },
  {
    id: 4,
    name: "Max Chen",
    username: "@max_creates",
    avatar: "https://picsum.photos/seed/user4/60/60",
  },
  {
    id: 5,
    name: "Priya Sharma",
    username: "@priya_s",
    avatar: "https://picsum.photos/seed/user5/60/60",
  },
  {
    id: 6,
    name: "Alex Nova",
    username: "@alex_nova",
    avatar: "https://picsum.photos/seed/user6/60/60",
  },
];

const MOCK_POSTS = [
  {
    id: 1,
    user: MOCK_USERS[0],
    image: "https://picsum.photos/seed/post1/400/400",
    caption: "Chasing sunsets at the edge of the world 🌅 #travel #wanderlust",
    likes: 2847,
    comments: 134,
    saved: false,
  },
  {
    id: 2,
    user: MOCK_USERS[1],
    image: "https://picsum.photos/seed/post2/400/400",
    caption: "Morning matcha ritual ☕ Finding peace in simplicity #aesthetic",
    likes: 1923,
    comments: 89,
    saved: true,
  },
  {
    id: 3,
    user: MOCK_USERS[2],
    image: "https://picsum.photos/seed/post3/400/400",
    caption:
      "New canvas, new story 🎨 Abstract expressionism is my language #art",
    likes: 3412,
    comments: 201,
    saved: false,
  },
  {
    id: 4,
    user: MOCK_USERS[3],
    image: "https://picsum.photos/seed/post4/400/400",
    caption: "Building the future, one line of code at a time 💻 #tech #dev",
    likes: 987,
    comments: 67,
    saved: false,
  },
  {
    id: 5,
    user: MOCK_USERS[4],
    image: "https://picsum.photos/seed/post5/400/400",
    caption: "Festival of lights and colors 🪔 Diwali vibes all night long!",
    likes: 5621,
    comments: 342,
    saved: true,
  },
  {
    id: 6,
    user: MOCK_USERS[5],
    image: "https://picsum.photos/seed/post6/400/400",
    caption:
      "Beyond the stars ✨ Night photography obsession #astrophotography",
    likes: 4210,
    comments: 178,
    saved: false,
  },
];

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set([2, 5]));
  const [animatingLike, setAnimatingLike] = useState<number | null>(null);

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
    setAnimatingLike(postId);
    setTimeout(() => setAnimatingLike(null), 400);
  };

  const handleSave = (postId: number) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

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
          {/* Search */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.07)" }}
            data-ocid="home.search_input"
          >
            <Search className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm">Search...</span>
          </button>

          {/* Logo */}
          <h1 className="text-lg font-bold gradient-text">SocialVerse</h1>

          {/* Icons */}
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

          {MOCK_USERS.map((user, idx) => (
            <div
              key={user.id}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              data-ocid={`home.stories.item.${idx + 1}`}
            >
              <div className="gradient-ring">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover block"
                  style={{ border: "2px solid #0B0C10" }}
                />
              </div>
              <span className="text-white/60 text-xs truncate w-16 text-center">
                {user.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section className="px-4 space-y-5 mt-2" data-ocid="home.feed.section">
        {MOCK_POSTS.map((post, idx) => (
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
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-9 h-9 rounded-full object-cover block"
                  style={{ border: "2px solid #0B0C10" }}
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">
                  {post.user.name}
                </p>
                <p className="text-white/40 text-xs">{post.user.username}</p>
              </div>
              <button
                type="button"
                className="text-white/40 hover:text-white/70 text-lg"
              >
                ···
              </button>
            </div>

            {/* Post image */}
            <img
              src={post.image}
              alt="Post"
              className="w-full aspect-square object-cover"
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
                    color: likedPosts.has(post.id)
                      ? "#FF4DA6"
                      : "rgba(255,255,255,0.7)",
                    fill: likedPosts.has(post.id) ? "#FF4DA6" : "transparent",
                  }}
                />
                <span className="text-white/60 text-sm">
                  {(
                    post.likes + (likedPosts.has(post.id) ? 1 : 0)
                  ).toLocaleString()}
                </span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5"
                data-ocid={`home.feed.comment.${idx + 1}`}
              >
                <MessageCircle className="w-6 h-6 text-white/70" />
                <span className="text-white/60 text-sm">{post.comments}</span>
              </button>

              <button type="button" data-ocid={`home.feed.share.${idx + 1}`}>
                <Share2 className="w-6 h-6 text-white/70" />
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
                    fill: savedPosts.has(post.id) ? "#7A5CFF" : "transparent",
                  }}
                />
              </button>
            </div>

            {/* Caption */}
            <div className="px-3 pb-3">
              <p className="text-white/80 text-sm">
                <span className="font-semibold text-white">
                  {post.user.name}
                </span>{" "}
                {post.caption}
              </p>
            </div>
          </article>
        ))}
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
