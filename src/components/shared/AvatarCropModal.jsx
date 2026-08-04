import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { FiCheck, FiX, FiZoomIn } from "react-icons/fi";

import { getCroppedImageFile } from "../../utils/cropImage";

/*
|--------------------------------------------------------------------------
| Avatar Crop Modal
|--------------------------------------------------------------------------
|
| WhatsApp/LinkedIn-style "select the part of the photo you want" crop
| step, shown right after a profile photo file is chosen and before it's
| uploaded. Circular crop area, pinch/scroll-to-zoom, drag to reposition.
|
| Props:
|   imageSrc   - object URL of the just-selected file (required to open)
|   fileName   - original file name, reused for the cropped output
|   onCancel   - called when the user backs out; parent should also
|                revoke the object URL it created for imageSrc
|   onComplete - called with a cropped File (square JPEG) ready to upload
|
| Usage pattern in the parent:
|
|   const [cropSrc, setCropSrc] = useState(null);
|
|   const handleFileSelect = (file) => {
|     setCropSrc(URL.createObjectURL(file));
|   };
|
|   {cropSrc && (
|     <AvatarCropModal
|       imageSrc={cropSrc}
|       onCancel={() => setCropSrc(null)}
|       onComplete={(croppedFile) => {
|         setPhotoFile(croppedFile);
|         setCropSrc(null);
|       }}
|     />
|   )}
|--------------------------------------------------------------------------
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust profile photo"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            Adjust your photo
          </h3>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative h-80 w-full bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        {/* Zoom control */}
        <div className="flex items-center gap-3 px-5 pt-4">
          <FiZoomIn size={16} className="shrink-0 text-slate-400" />

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
            aria-label="Zoom"
          />
        </div>

        {error && (
          <p className="px-5 pt-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <p className="px-5 pt-3 text-xs text-slate-400">
          Drag to reposition. Use the slider to zoom.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiCheck size={15} />
            {saving ? "Saving..." : "Use this photo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarCropModal;
