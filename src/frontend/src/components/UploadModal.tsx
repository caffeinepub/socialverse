import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Film, Image, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ExternalBlob, MediaType } from "../backend";
import { useBackend } from "../hooks/useBackend";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

type ContentType = "Post" | "Reel" | "Story";
type UploadState =
  | "idle"
  | "reading"
  | "uploading"
  | "posting"
  | "done"
  | "error";

function getMediaType(file: File): MediaType {
  return file.type.startsWith("video/") ? MediaType.video : MediaType.photo;
}

function isValidFile(file: File): boolean {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  return allowed.includes(file.type);
}

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const { backend } = useBackend();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<ContentType>("Post");
  const [caption, setCaption] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!isValidFile(file)) {
      setErrorMsg("Unsupported file type. Please upload an image or video.");
      setUploadState("error");
      return;
    }
    fileRef.current = file;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setProgress(0);
    setUploadState("reading");
    setErrorMsg(null);

    // Simulate brief "reading" state then mark ready
    setTimeout(() => setUploadState("idle"), 300);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileRef.current = null;
    setPreview(null);
    setProgress(0);
    setUploadState("idle");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (uploadState === "uploading" || uploadState === "posting") return;
    fileRef.current = null;
    setPreview(null);
    setProgress(0);
    setUploadState("idle");
    setCaption("");
    setSelectedType("Post");
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleSubmit = async () => {
    const file = fileRef.current;
    if (
      !file ||
      !backend ||
      uploadState === "uploading" ||
      uploadState === "posting"
    )
      return;

    try {
      setErrorMsg(null);
      setProgress(0);
      setUploadState("uploading");

      // Read file bytes
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setProgress(pct);
      });

      const mediaType = getMediaType(file);

      setUploadState("posting");
      setProgress(100);

      await backend.createPost(caption, blob, mediaType);

      // Invalidate feed cache so the new post appears
      await queryClient.invalidateQueries({ queryKey: ["posts"] });

      setUploadState("done");

      // Close after brief success pause
      setTimeout(() => {
        handleClose();
      }, 800);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setErrorMsg(msg);
      setUploadState("error");
      setProgress(0);
    }
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!preview) fileInputRef.current?.click();
    }
  };

  const isSubmitting = uploadState === "uploading" || uploadState === "posting";
  const canSubmit =
    !!fileRef.current && !isSubmitting && uploadState !== "done" && !!backend;

  const progressLabel = () => {
    if (uploadState === "uploading") return "Uploading media...";
    if (uploadState === "posting") return "Creating post...";
    if (uploadState === "done") return "Posted!";
    if (uploadState === "error") return "Upload failed";
    return "Ready to share!";
  };

  const progressColor = () => {
    if (uploadState === "done") return "#22c55e";
    if (uploadState === "error") return "#ef4444";
    return "#7A5CFF";
  };

  const showProgress =
    isSubmitting || uploadState === "done" || uploadState === "error";

  const types: { key: ContentType; icon: typeof Image; color: string }[] = [
    { key: "Post", icon: Image, color: "#7A5CFF" },
    { key: "Reel", icon: Film, color: "#FF4DA6" },
    { key: "Story", icon: Clock, color: "#FF9A3D" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="p-0 border-0 max-w-sm w-full"
        style={{
          backgroundColor: "#131419",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          fontFamily: "Inter, sans-serif",
        }}
        data-ocid="upload.modal"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <h2 className="text-white font-semibold">Create New</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.07)" }}
            data-ocid="upload.close_button"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type selector */}
          <div
            className="flex gap-2 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
            data-ocid="upload.type.toggle"
          >
            {types.map(({ key, icon: Icon, color }) => (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedType(key)}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40"
                style={{
                  background:
                    selectedType === key ? `${color}25` : "transparent",
                  color:
                    selectedType === key ? color : "rgba(255,255,255,0.45)",
                  border:
                    selectedType === key
                      ? `1px solid ${color}40`
                      : "1px solid transparent",
                }}
                data-ocid={`upload.${key.toLowerCase()}.tab`}
              >
                <Icon className="w-4 h-4" />
                {key}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          {/* biome-ignore lint/a11y/useSemanticElements: dropzone needs div for nested button support */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file drop zone"
            onClick={() =>
              !preview && !isSubmitting && fileInputRef.current?.click()
            }
            onKeyDown={handleDropZoneKeyDown}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="relative flex items-center justify-center overflow-hidden transition-all duration-200"
            style={{
              height: preview ? 220 : 160,
              borderRadius: 16,
              cursor: preview ? "default" : "pointer",
              border: dragging
                ? "2px dashed #7A5CFF"
                : preview
                  ? "none"
                  : "2px dashed rgba(255,255,255,0.15)",
              background: dragging
                ? "rgba(122,92,255,0.1)"
                : preview
                  ? "transparent"
                  : "rgba(255,255,255,0.03)",
            }}
            data-ocid="upload.dropzone"
          >
            {preview ? (
              <>
                {fileRef.current?.type.startsWith("video/") ? (
                  <video
                    src={preview}
                    className="w-full h-full object-cover rounded-2xl"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    data-ocid="upload.remove.button"
                    aria-label="Remove file"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
                {/* Upload overlay spinner */}
                {isSubmitting && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(122,92,255,0.15)" }}
                >
                  <Upload className="w-6 h-6" style={{ color: "#7A5CFF" }} />
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-sm font-medium">
                    Drop your file here
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    Photos & videos · click to browse
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleInputChange}
            data-ocid="upload.upload_button"
          />

          {/* Progress bar */}
          {showProgress && (
            <div className="space-y-1.5" data-ocid="upload.progress.section">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">{progressLabel()}</span>
                {uploadState !== "error" && (
                  <span className="text-xs" style={{ color: progressColor() }}>
                    {Math.min(Math.round(progress), 100)}%
                  </span>
                )}
              </div>
              <Progress
                value={Math.min(progress, 100)}
                className="h-1.5"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <p
              className="text-xs px-3 py-2 rounded-lg"
              style={{
                color: "#ef4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
              data-ocid="upload.error.message"
            >
              {errorMsg}
            </p>
          )}

          {/* Caption */}
          <Textarea
            placeholder={`Write a caption for your ${selectedType.toLowerCase()}...`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="resize-none text-sm disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "white",
            }}
            data-ocid="upload.caption.textarea"
          />

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "linear-gradient(90deg, #7A5CFF, #FF4DA6, #FF9A3D)",
              opacity: canSubmit ? 1 : 0.4,
            }}
            data-ocid="upload.submit_button"
          >
            {uploadState === "uploading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : uploadState === "posting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : uploadState === "done" ? (
              "Posted! ✓"
            ) : (
              `Share ${selectedType}`
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
