"use client";

import React, { useState } from "react";

interface ImageItem {
  id?: string;
  url: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  title: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-4/3 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
        No image available
      </div>
    );
  }

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Featured Large Image */}
      <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs">
        <img
          src={activeImage.url}
          alt={`${title} - view ${selectedIndex + 1}`}
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedIndex === idx
                  ? "border-indigo-600 ring-2 ring-indigo-500/20"
                  : "border-zinc-200 hover:border-zinc-300 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
