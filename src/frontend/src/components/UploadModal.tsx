import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Film, Image, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

type ContentType = "Post" | "Reel" | "Story";

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const [selectedType, setSelectedType] = useState<ContentType>("Post");
  const [caption, setCaption] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setProgress(0);
    setUploaded(false);
    setUploading(true);

    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current!);
          setUploading(false);
          setUploaded(true);
          return 100;
        }
        return prev + Math.random() * 8 + 3;
      });
    }, 150);
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

  const handleClose = () => {
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setPreview(null);
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setCaption("");
    setSelectedType("Post");
    onClose();
  };

  const handleSubmit = () => {
    if (!uploaded) return;
    handleClose();
  };

  const handleDropZoneKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!preview) fileInputRef.current?.click();
    }
  };

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
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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
            onClick={() => !preview && fileInputRef.current?.click()}
            onKeyDown={handleDropZoneKeyDown}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="relative flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200"
            style={{
              height: preview ? 220 : 160,
              borderRadius: 16,
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
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setProgress(0);
                    setUploaded(false);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                  data-ocid="upload.remove.button"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
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
                    or click to browse
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleInputChange}
            data-ocid="upload.upload_button"
          />

          {/* Progress bar */}
          {(uploading || uploaded) && (
            <div className="space-y-1.5" data-ocid="upload.progress.section">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-xs">
                  {uploading ? "Processing..." : "Ready to share!"}
                </span>
                <span
                  className="text-xs"
                  style={{ color: uploaded ? "#22c55e" : "#7A5CFF" }}
                >
                  {Math.min(Math.round(progress), 100)}%
                </span>
              </div>
              <Progress
                value={Math.min(progress, 100)}
                className="h-1.5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                }}
              />
            </div>
          )}

          {/* Caption */}
          <Textarea
            placeholder={`Write a caption for your ${selectedType.toLowerCase()}...`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="resize-none text-sm"
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
            disabled={!uploaded || uploading}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "linear-gradient(90deg, #7A5CFF, #FF4DA6, #FF9A3D)",
              opacity: uploaded && !uploading ? 1 : 0.4,
            }}
            data-ocid="upload.submit_button"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Share ${selectedType}`
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
