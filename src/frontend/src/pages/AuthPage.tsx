import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Fingerprint, Loader2 } from "lucide-react";
import { useState } from "react";
import { useBackend } from "../hooks/useBackend";
import { useUserProfile } from "../hooks/useUserProfile";

interface ProfileSetupProps {
  onComplete: () => void;
}

function ProfileSetupScreen({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { backend } = useBackend();
  const { setProfile } = useUserProfile();

  const handleSubmit = async () => {
    if (!name.trim() || !username.trim()) {
      setError("Name and username are required");
      return;
    }
    if (!backend) return;

    setIsSubmitting(true);
    setError("");
    try {
      const cleanUsername = username.replace(/^@/, "").trim();
      const success = await backend.createUserProfile(
        cleanUsername,
        name.trim(),
        bio.trim(),
      );
      if (success) {
        const profile = await backend.getCallerUserProfile();
        if (profile) setProfile(profile);
        onComplete();
      } else {
        setError("Username already taken. Try a different one.");
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="profile.setup.page"
    >
      {/* Gradient blobs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, #7A5CFF 0%, transparent 70%)",
          top: "-10%",
          left: "-10%",
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #FF4DA6 0%, transparent 70%)",
          bottom: "-10%",
          right: "-10%",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-8 rounded-3xl"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #7A5CFF, #FF4DA6, #FF9A3D)",
            }}
          >
            <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">Set Up Profile</h1>
          <p className="text-white/40 text-sm mt-1">
            Create your SocialVerse identity
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 rounded-xl"
            data-ocid="profile.setup.name.input"
          />
          <Input
            placeholder="Username (e.g. @yourname)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 rounded-xl"
            data-ocid="profile.setup.username.input"
          />
          <Input
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500 rounded-xl"
            data-ocid="profile.setup.bio.input"
          />
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !name.trim() || !username.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity duration-200"
          style={{
            background: "linear-gradient(90deg, #7A5CFF, #FF4DA6, #FF9A3D)",
            opacity: isSubmitting || !name.trim() || !username.trim() ? 0.6 : 1,
          }}
          data-ocid="profile.setup.submit_button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating profile...
            </>
          ) : (
            "Create Profile"
          )}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [tab, setTab] = useState<"login" | "signup">("login");

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#0B0C10", fontFamily: "Inter, sans-serif" }}
      data-ocid="auth.page"
    >
      {/* Gradient blobs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, #7A5CFF 0%, transparent 70%)",
          top: "-10%",
          left: "-10%",
        }}
      />
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #FF4DA6 0%, transparent 70%)",
          bottom: "-10%",
          right: "-10%",
        }}
      />
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-15"
        style={{
          background: "radial-gradient(circle, #FF9A3D 0%, transparent 70%)",
          top: "50%",
          right: "5%",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 p-8 rounded-3xl"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "linear-gradient(135deg, #7A5CFF, #FF4DA6, #FF9A3D)",
            }}
          >
            <span className="text-2xl">🌐</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">SocialVerse</h1>
          <p className="text-white/40 text-sm mt-1">Your world, connected</p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "rgba(255,255,255,0.05)" }}
          data-ocid="auth.tab"
        >
          <button
            type="button"
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background:
                tab === "login"
                  ? "linear-gradient(90deg, #7A5CFF, #FF4DA6)"
                  : "transparent",
              color: tab === "login" ? "white" : "rgba(255,255,255,0.5)",
            }}
            onClick={() => setTab("login")}
            data-ocid="auth.login.tab"
          >
            Login
          </button>
          <button
            type="button"
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background:
                tab === "signup"
                  ? "linear-gradient(90deg, #7A5CFF, #FF4DA6)"
                  : "transparent",
              color: tab === "signup" ? "white" : "rgba(255,255,255,0.5)",
            }}
            onClick={() => setTab("signup")}
            data-ocid="auth.signup.tab"
          >
            Sign Up
          </button>
        </div>

        {tab === "login" && (
          <p className="text-white/50 text-sm text-center mb-6">
            Secure, passwordless login with Internet Identity
          </p>
        )}

        {tab === "signup" && (
          <p className="text-white/50 text-sm text-center mb-6">
            Sign up with Internet Identity — you'll set up your profile after
          </p>
        )}

        {/* Login button */}
        <button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          className="w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity duration-200"
          style={{
            background: "linear-gradient(90deg, #7A5CFF, #FF4DA6, #FF9A3D)",
            opacity: isLoggingIn ? 0.7 : 1,
          }}
          data-ocid="auth.submit_button"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5" />
              Continue with Internet Identity
            </>
          )}
        </button>

        <p className="text-white/25 text-xs text-center mt-4">
          Powered by Internet Computer · Decentralized Auth
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
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
      </div>
    </div>
  );
}

export { ProfileSetupScreen };
