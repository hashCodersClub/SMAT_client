/*
|--------------------------------------------------------------------------
| Crop Image Utility
|--------------------------------------------------------------------------
|
| Takes a source image and a pixel crop area (as reported by
| react-easy-crop's onCropComplete) and renders just that region onto an
| offscreen canvas, returning it as a File ready to upload.
|--------------------------------------------------------------------------
*/

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = src;
  });

/**
 * @param {string} imageSrc - object URL or data URL of the source image
 * @param {{x:number,y:number,width:number,height:number}} croppedAreaPixels
 * @param {object} [options]
 * @param {number} [options.outputSize=512] - output is square, this is the side length
 * @param {string} [options.fileName="avatar.jpg"]
 * @param {number} [options.quality=0.92]
 * @returns {Promise<File>}
 */
export const getCroppedImageFile = async (
  imageSrc,
  croppedAreaPixels,
  {
    outputSize = 512,
    fileName = "avatar.jpg",
    quality = 0.92,
    mimeType = "image/jpeg",
  } = {},
) => {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is not supported in this browser");
  }

  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Failed to crop image"));
        }
      },
      mimeType,
      quality,
    );
  });

  return new File([blob], fileName, { type: mimeType });
};
