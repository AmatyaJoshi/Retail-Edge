import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogHeader, DialogFooter, DialogTitle } from './dialog';
import { Button } from './button';

interface PhotoAdjustModalProps {
  open: boolean;
  image: string; // base64 or object URL
  onClose: () => void;
  onSave: (croppedImage: Blob | string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed for cross-origin images
    image.src = url;
  });
};

async function getCroppedImg(imageSrc: string, crop: any, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  if (!ctx) throw new Error('No 2d context');

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    (safeArea - image.width) / 2,
    (safeArea - image.height) / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // set canvas to final size
  canvas.width = crop.width;
  canvas.height = crop.height;

  // draw cropped image
  ctx.putImageData(
    data,
    Math.round(0 - (safeArea / 2 - image.width / 2) - crop.x),
    Math.round(0 - (safeArea / 2 - image.height / 2) - crop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
    }, 'image/png');
  });
}

export const PhotoAdjustModal: React.FC<PhotoAdjustModalProps> = ({ open, image, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const croppedImg = await getCroppedImg(image, croppedAreaPixels, rotation);
      onSave(croppedImg);
    } finally {
      setSaving(false);
    }
  }, [image, croppedAreaPixels, rotation, onSave]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPrimitive.Content
        className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-gray-900 dark:bg-gray-900 text-white border border-gray-700 shadow-2xl rounded-2xl"
        onPointerDownOutside={e => e.preventDefault()}
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">Adjust Photo</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            cropShape="rect"
            showGrid={true}
            style={{ containerStyle: { background: '#18181b' } }}
          />
        </div>
        <div className="flex items-center gap-4 mt-4">
          <label className="flex-1 text-gray-200">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </label>
          <label className="flex-1 text-gray-200">
            Rotate
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving} className="bg-gray-800 text-gray-200 border-gray-600 hover:bg-gray-700">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">{saving ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogPrimitive.Content>
    </Dialog>
  );
};

export default PhotoAdjustModal; 