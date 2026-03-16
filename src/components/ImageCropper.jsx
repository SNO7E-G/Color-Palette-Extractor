import { useState, useCallback, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({
    unit: '%',
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const imgRef = useRef(null);

  const handleCropComplete = useCallback(async () => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const pixelCrop = {
      x: crop.x * scaleX,
      y: crop.y * scaleY,
      width: crop.width * scaleX,
      height: crop.height * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
        onCropComplete(file);
      }
    }, 'image/png');
  }, [crop, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-auto space-y-4">
        <h3 className="text-lg font-semibold text-white text-center">
          Select Region
          <span className="block text-xs text-gray-500 font-normal mt-1">
            Drag to select the area to extract colors from
          </span>
        </h3>

        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              className="max-h-[60vh] rounded-lg"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCropComplete}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors"
          >
            Extract from Selection
          </button>
        </div>
      </div>
    </div>
  );
}
