import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-500"
      style={{
        backgroundColor: "#0B0C10",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Gradient glow blobs */}
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #7A5CFF 0%, transparent 70%)",
          top: "20%",
          left: "15%",
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, #FF4DA6 0%, transparent 70%)",
          bottom: "20%",
          right: "15%",
        }}
      />

      {/* Logo container */}
      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Spinning gradient ring */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-spin-slow"
            style={{
              background:
                "conic-gradient(from 0deg, #7A5CFF, #FF4DA6, #FF9A3D, #7A5CFF)",
              padding: "3px",
              borderRadius: "50%",
            }}
          />
          <div
            className="absolute inset-1 rounded-full"
            style={{ backgroundColor: "#0B0C10" }}
          />
          <span className="relative z-10 text-4xl">🌐</span>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight gradient-text"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            SocialVerse
          </h1>
          <p className="text-white/40 text-sm mt-1 tracking-widest uppercase">
            Connect · Create · Explore
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(90deg, #7A5CFF, #FF4DA6)",
                animation: `pulse-scale 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
