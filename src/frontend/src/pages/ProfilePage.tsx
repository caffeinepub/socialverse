import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  Film,
  Grid3X3,
  Heart,
  Loader2,
  Settings,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useBackend } from "../hooks/useBackend";
import { useUserProfile } from "../hooks/useUserProfile";
import { ExternalBlob, MediaType } from "../types";
import type { Post } from "../types";

function formatCount(n: bigint | number): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function PostGrid({ posts, loading }: { posts: Post[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-0.5 mt-1">
        {["s1", "s2", "s3", "s4", "s5", "s6"].map((key) => (
          <div
            key={key}
            className="aspect-square animate-pulse"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="profile.empty_state"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: "rgba(122,92,255,0.15)" }}
        >
          <Grid3X3 className="w-7 h-7" style={{ color: "#7A5CFF" }} />
        </div>
        <p className="text-white font-semibold text-base">No posts yet</p>
        <p className="text-white/40 text-sm mt-1">
          Share your first photo or video
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 mt-1">
      {posts.map((post, idx) => (
        <div
          key={post.id}
          className="relative aspect-square cursor-pointer overflow-hidden"
          data-ocid={`profile.grid.item.${idx + 1}`}
        >
          {post.mediaType === MediaType.video ? (
            <div className="w-full h-full relative">
              <video
                src={post.mediaId.getDirectURL()}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute top-1.5 right-1.5">
                <Film className="w-3 h-3 text-white drop-shadow" />
              </div>
            </div>
          ) : (
            <img
              src={post.mediaId.getDirectURL()}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            />
          )}
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5 text-white" style={{ fill: "white" }} />
              <span className="text-white text-sm font-semibold">
                {formatCount(post.likeCount)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface EditProfileModalProps {
  onClose: () => void;
  currentDisplayName: string;
  currentBio: string;
  currentAvatarUrl?: string;
  onSaved: () => void;
}

function EditProfileModal({
  onClose,
  currentDisplayName,
  currentBio,
  currentAvatarUrl,
  onSaved,
}: EditProfileModalProps) {
  const { backend } = useBackend();
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [bio, setBio] = useState(currentBio);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    currentAvatarUrl,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!backend) throw new Error("Backend not ready");
      let avatarBlob: ExternalBlob | null = null;
      if (avatarFile) {
        const bytes = new Uint8Array(await avatarFile.arrayBuffer());
        avatarBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }
      await backend.updateUserProfile(displayName, bio, avatarBlob);
    },
    onSuccess: () => {
      onSaved();
      onClose();
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      data-ocid="profile.edit_modal"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{
          background: "rgba(18,19,26,0.97)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
            data-ocid="profile.edit_modal.close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Avatar picker */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
            aria-label="Change avatar"
            data-ocid="profile.edit_modal.avatar"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid #7A5CFF" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(122,92,255,0.2)",
                  border: "3px solid #7A5CFF",
                }}
              >
                <Camera className="w-8 h-8" style={{ color: "#7A5CFF" }} />
              </div>
            )}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-6">
          <div>
            <label
              className="block text-white/60 text-xs mb-1 font-medium"
              htmlFor="edit-display-name"
            >
              Display Name
            </label>
            <input
              id="edit-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              placeholder="Your display name"
              data-ocid="profile.edit_modal.name_input"
            />
          </div>
          <div>
            <label
              className="block text-white/60 text-xs mb-1 font-medium"
              htmlFor="edit-bio"
            >
              Bio
            </label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none resize-none"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              placeholder="Tell your story..."
              data-ocid="profile.edit_modal.bio_input"
            />
          </div>
        </div>

        {/* Upload progress */}
        {mutation.isPending && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${uploadProgress}%`,
                  background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                }}
              />
            </div>
          </div>
        )}

        {mutation.isError && (
          <p className="text-red-400 text-sm mb-3 text-center">
            Failed to save. Please try again.
          </p>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !displayName.trim()}
          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
          style={{
            background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
            opacity: mutation.isPending || !displayName.trim() ? 0.6 : 1,
          }}
          data-ocid="profile.edit_modal.save_button"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "liked">(
    "posts",
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const { profile, isLoadingProfile, refetchProfile } = useUserProfile();
  const { backend, isFetching } = useBackend();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const userId = identity?.getPrincipal();

  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ["userPosts", userId?.toString()],
    queryFn: async () => {
      if (!backend || !userId) return [];
      return backend.getPostsByUser(userId);
    },
    enabled: !!backend && !isFetching && !!userId,
  });

  const posts = userPosts.filter((p) => p.mediaType === MediaType.photo);
  const reels = userPosts.filter((p) => p.mediaType === MediaType.video);

  const tabs = [
    { key: "posts" as const, label: "Posts", icon: Grid3X3 },
    { key: "reels" as const, label: "Reels", icon: Film },
    { key: "liked" as const, label: "Liked", icon: Heart },
  ];

  const currentPosts =
    activeTab === "posts" ? posts : activeTab === "reels" ? reels : [];
  const isGridLoading = isLoadingPosts || isLoadingProfile;

  const avatarUrl = profile?.avatarMediaId?.getDirectURL();

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
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-14 relative z-10">
        {/* Avatar */}
        <div className="gradient-ring inline-block mb-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover block"
              style={{ border: "3px solid #0B0C10" }}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center block"
              style={{
                border: "3px solid #0B0C10",
                background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)",
              }}
            >
              <span className="text-white text-3xl font-bold">
                {(profile?.displayName ?? "?")[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name & Bio */}
        <div className="mb-4">
          {isLoadingProfile ? (
            <div className="space-y-2">
              <div
                className="h-5 w-32 rounded animate-pulse"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
              <div
                className="h-4 w-24 rounded animate-pulse"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <div
                className="h-4 w-48 rounded animate-pulse"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>
          ) : (
            <>
              <h1 className="text-white text-xl font-bold">
                {profile?.displayName ?? "Unknown User"}
              </h1>
              <p className="text-white/50 text-sm">
                @{profile?.username ?? ""}
              </p>
              {profile?.bio ? (
                <p className="text-white/70 text-sm mt-2 break-words">
                  {profile.bio}
                </p>
              ) : null}
            </>
          )}
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
              {isLoadingProfile ? (
                <span
                  className="inline-block w-8 h-5 rounded animate-pulse"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              ) : (
                formatCount(profile?.postCount ?? 0n)
              )}
            </p>
            <p className="text-white/40 text-xs">Posts</p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {isLoadingProfile ? (
                <span
                  className="inline-block w-10 h-5 rounded animate-pulse"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              ) : (
                formatCount(profile?.followerCount ?? 0n)
              )}
            </p>
            <p className="text-white/40 text-xs">Followers</p>
          </div>
          <div
            className="w-px h-8"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="text-center">
            <p className="text-white font-bold text-lg">
              {isLoadingProfile ? (
                <span
                  className="inline-block w-8 h-5 rounded animate-pulse"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              ) : (
                formatCount(profile?.followingCount ?? 0n)
              )}
            </p>
            <p className="text-white/40 text-xs">Following</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
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

        <PostGrid
          posts={currentPosts}
          loading={isGridLoading && activeTab !== "liked"}
        />

        {activeTab === "liked" && (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="profile.liked.empty"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(255,77,166,0.15)" }}
            >
              <Heart className="w-7 h-7" style={{ color: "#FF4DA6" }} />
            </div>
            <p className="text-white font-semibold text-base">
              Posts you liked
            </p>
            <p className="text-white/40 text-sm mt-1">
              Like posts to see them here
            </p>
          </div>
        )}
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

      {showEditModal && (
        <EditProfileModal
          onClose={() => setShowEditModal(false)}
          currentDisplayName={profile?.displayName ?? ""}
          currentBio={profile?.bio ?? ""}
          currentAvatarUrl={avatarUrl}
          onSaved={() => {
            refetchProfile();
            queryClient.invalidateQueries({ queryKey: ["userPosts"] });
          }}
        />
      )}
    </div>
  );
}
