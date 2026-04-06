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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

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
      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}
