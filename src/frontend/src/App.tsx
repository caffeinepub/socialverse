import { useEffect, useState } from "react";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";
import UploadModal from "./components/UploadModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ReelsPage from "./pages/ReelsPage";

type Page = "home" | "reels" | "explore" | "chat" | "profile";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [showUpload, setShowUpload] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      const dismissed = sessionStorage.getItem("pwa-install-dismissed");
      if (!dismissed) setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setShowInstallBanner(false);
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "1");
  };

  if (showSplash || isInitializing) {
    return <SplashScreen />;
  }

  if (!identity) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "reels":
        return <ReelsPage />;
      case "explore":
        return <ExplorePage />;
      case "chat":
        return <ChatPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
    >
      <main className="pb-24">{renderPage()}</main>

      <BottomNav
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        onUpload={() => setShowUpload(true)}
      />

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div
          data-ocid="pwa.install.panel"
          className="fixed bottom-24 left-4 right-4 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(11, 12, 16, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(122, 92, 255, 0.4)",
            boxShadow: "0 8px 32px rgba(122, 92, 255, 0.2)",
          }}
        >
          <img
            src="/assets/generated/socialverse-icon-192.dim_192x192.png"
            alt="SocialVerse"
            className="w-10 h-10 rounded-xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">
              Install SocialVerse
            </p>
            <p className="text-white/50 text-xs">Home screen pe add karo</p>
          </div>
          <button
            type="button"
            data-ocid="pwa.install.primary_button"
            onClick={handleInstall}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7A5CFF, #FF4DA6)" }}
          >
            Install
          </button>
          <button
            type="button"
            data-ocid="pwa.install.close_button"
            onClick={dismissBanner}
            className="text-white/40 hover:text-white/80 flex-shrink-0 p-1 transition-colors"
            aria-label="Dismiss install banner"
          >
            ✕
          </button>
        </div>
      )}

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}
