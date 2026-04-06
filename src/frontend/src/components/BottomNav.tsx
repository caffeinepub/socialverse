import { Film, Home, MessageCircle, Plus, User } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onUpload: () => void;
}

export default function BottomNav({
  currentPage,
  onNavigate,
  onUpload,
}: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "reels", icon: Film, label: "Reels" },
    { id: "upload", icon: Plus, label: "Upload", isUpload: true },
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
      style={{ width: "calc(100% - 2rem)", maxWidth: 480 }}
      data-ocid="nav.section"
    >
      <div
        className="flex items-center justify-around px-2 py-2 rounded-3xl"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(20,21,28,0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {navItems.map((item) => {
          if (item.isUpload) {
            return (
              <button
                type="button"
                key={item.id}
                onClick={onUpload}
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-150 active:scale-90"
                style={{
                  background:
                    "linear-gradient(135deg, #7A5CFF, #FF4DA6, #FF9A3D)",
                  boxShadow: "0 4px 15px rgba(122,92,255,0.4)",
                }}
                data-ocid="nav.upload.button"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            );
          }

          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all duration-200"
              style={{
                background: isActive ? "rgba(122,92,255,0.15)" : "transparent",
              }}
              data-ocid={`nav.${item.id}.link`}
            >
              <item.icon
                className="w-5 h-5"
                style={{
                  color: isActive ? "#7A5CFF" : "rgba(255,255,255,0.5)",
                  strokeWidth: isActive ? 2.5 : 1.5,
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: isActive ? "#7A5CFF" : "rgba(255,255,255,0.4)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
