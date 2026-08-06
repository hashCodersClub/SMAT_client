import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { FiCheck, FiMinus, FiPlus, FiX, FiZoomIn } from "react-icons/fi";

import { getCroppedImageFile } from "../../utils/cropImage";

/*
|--------------------------------------------------------------------------
| Avatar Crop Modal (LinkedIn-Style)
|--------------------------------------------------------------------------
|
| LinkedIn-style "select the part of the photo you want" crop step.
| Circular crop area, locked background scrolling, pinch/scroll-to-zoom,
| drag to reposition, zoom control buttons.
|
*/

const AvatarCropModal = ({
  imageSrc,
  fileName = "avatar.jpg",
  onCancel,
  onComplete,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll while crop modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setSaving(true);
      setError("");

      const croppedFile = await getCroppedImageFile(
        imageSrc,
        croppedAreaPixels,
        { fileName },
      );

      onComplete(croppedFile);
    } catch (err) {
      console.error("Failed to crop image:", err);
      setError("Couldn't process that image. Please try another one.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-fade-in overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust profile photo"
    >
      <div className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Crop & Position Photo
            </h3>
            <p className="text-xs text-slate-500">
              Drag image to position, scroll or use slider to zoom
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Crop area - Fixed height container */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-950 shrink-0 overflow-hidden touch-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Controls and Footer */}
        <div className="p-5 space-y-4 overflow-y-auto shrink-0">
          {/* Zoom controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <FiZoomIn size={14} className="text-indigo-600" /> Zoom
              </span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition active:scale-95"
                title="Zoom Out"
              >
                <FiMinus size={14} />
              </button>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600 focus:outline-none"
                aria-label="Zoom"
              />

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition active:scale-95"
                title="Zoom In"
              >
                <FiPlus size={14} />
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !croppedAreaPixels}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiCheck size={16} />
              {saving ? "Applying Photo..." : "Save Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropModal;
