import { Film, Grid3X3, Heart, Settings, UserPlus } from "lucide-react";
import { useState } from "react";

const PROFILE_POSTS = [
  { id: 1, image: "https://picsum.photos/seed/post1/300/300", likes: 2847 },
  { id: 2, image: "https://picsum.photos/seed/post2/300/300", likes: 1923 },
  { id: 3, image: "https://picsum.photos/seed/post3/300/300", likes: 3412 },
  { id: 4, image: "https://picsum.photos/seed/post4/300/300", likes: 987 },
  { id: 5, image: "https://picsum.photos/seed/post5/300/300", likes: 5621 },
  { id: 6, image: "https://picsum.photos/seed/post6/300/300", likes: 4210 },
  { id: 7, image: "https://picsum.photos/seed/city1/300/300", likes: 1456 },
  { id: 8, image: "https://picsum.photos/seed/city2/300/300", likes: 2103 },
  { id: 9, image: "https://picsum.photos/seed/city3/300/300", likes: 3891 },
];

const PROFILE_REELS = [
  { id: 1, image: "https://picsum.photos/seed/reel1/300/300", views: "2.1M" },
  { id: 2, image: "https://picsum.photos/seed/reel2/300/300", views: "3.4M" },
  { id: 3, image: "https://picsum.photos/seed/reel3/300/300", views: "4.7M" },
  { id: 4, image: "https://picsum.photos/seed/reel4/300/300", views: "1.2M" },
  { id: 5, image: "https://picsum.photos/seed/reel5/300/300", views: "8.9M" },
  { id: 6, image: "https://picsum.photos/seed/reel6/300/300", views: "6.2M" },
];

const LIKED_POSTS = [
  { id: 1, image: "https://picsum.photos/seed/liked1/300/300", likes: 12345 },
  { id: 2, image: "https://picsum.photos/seed/liked2/300/300", likes: 8732 },
  { id: 3, image: "https://picsum.photos/seed/liked3/300/300", likes: 5410 },
  { id: 4, image: "https://picsum.photos/seed/liked4/300/300", likes: 19210 },
  { id: 5, image: "https://picsum.photos/seed/liked5/300/300", likes: 4325 },
  { id: 6, image: "https://picsum.photos/seed/liked6/300/300", likes: 7643 },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "liked">(
    "posts",
  );

  const tabs = [
    { key: "posts" as const, label: "Posts", icon: Grid3X3 },
    { key: "reels" as const, label: "Reels", icon: Film },
    { key: "liked" as const, label: "Liked", icon: Heart },
  ];

  const currentGrid =
    activeTab === "posts"
      ? PROFILE_POSTS
      : activeTab === "reels"
        ? PROFILE_REELS
        : LIKED_POSTS;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="profile.page"
    >
      {/* Banner */}
      <div className="relative h-44 overflow-hidden">
        <img
          src="https://picsum.photos/seed/banner1/800/300"
          alt="Banner"
          className="w-full h-full object-cover"
          style={{ filter: "blur(2px) brightness(0.5)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.8) 100%)",
          }}
        />
        {/* Settings button */}
        <button
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          data-ocid="profile.settings.button"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-14 relative z-10">
        {/* Avatar */}
        <div className="gradient-ring inline-block mb-3">
          <img
            src="https://picsum.photos/seed/myavatar/200/200"
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover block"
            style={{ border: "3px solid #0B0C10" }}
          />
        </div>

        {/* Name & Bio */}
        <div className="mb-4">
          <h1 className="text-white text-xl font-bold">Alex Rivera</h1>
          <p className="text-white/50 text-sm">@alex_rivera</p>
          <p className="text-white/70 text-sm mt-2">
            Digital creator &middot; Photographer &middot; Explorer
            <br />
            Capturing the world one frame at a time
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-xs text-white/40">Link:</span>
            <span className="text-xs" style={{ color: "#7A5CFF" }}>
              linktr.ee/alex_rivera
            </span>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center justify-around py-3 rounded-2xl mb-4"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          data-ocid="profile.stats.section"
        >
          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {PROFILE_POSTS.length}
            </p>
            <p className="text-white/40 text-xs">Posts</p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="text-center">
            <p className="text-white font-bold text-lg">248K</p>
            <p className="text-white/40 text-xs">Followers</p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="text-center">
            <p className="text-white font-bold text-lg">892</p>
            <p className="text-white/40 text-xs">Following</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
              color: "white",
            }}
            data-ocid="profile.edit.button"
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}
            data-ocid="profile.share.button"
          >
            Share Profile
          </button>
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            data-ocid="profile.follow.button"
          >
            <UserPlus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b mb-1"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
          data-ocid="profile.tabs.section"
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 transition-all duration-200"
              style={{
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #7A5CFF"
                    : "2px solid transparent",
                color:
                  activeTab === tab.key ? "#7A5CFF" : "rgba(255,255,255,0.4)",
              }}
              data-ocid={`profile.${tab.key}.tab`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-0.5 mt-1">
          {currentGrid.map((item, idx) => (
            <div
              key={item.id}
              className="relative aspect-square cursor-pointer overflow-hidden"
              data-ocid={`profile.grid.item.${idx + 1}`}
            >
              <img
                src={item.image}
                alt="Post"
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              />
              <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <div className="flex items-center gap-1">
                  <Heart
                    className="w-5 h-5 text-white"
                    style={{ fill: "white" }}
                  />
                  <span className="text-white text-sm font-semibold">
                    {"likes" in item
                      ? item.likes?.toLocaleString()
                      : "views" in item
                        ? item.views
                        : ""}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-white/20 text-xs">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
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
