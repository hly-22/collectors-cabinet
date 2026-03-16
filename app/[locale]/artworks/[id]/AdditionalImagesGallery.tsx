"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeftFromLine, ArrowRightFromLine, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  images: string[]; // additional images only
  title: string;
};

export default function AdditionalImagesGallery({ images, title }: Props) {

  const t = useTranslations();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, prev]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // No external triggers; carousel is for additional images only

  return (
    <div>
      <h2 className="text-sm font-medium mb-2">{t("artwork.additionalImages")}</h2>
      <div className="flex gap-1 overflow-x-auto overflow-y-hidden flex-nowrap pb-1 no-scrollbar">
        {images.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => openAt(idx)}
            className="group focus:outline-none"
          >
            <Image
              key={idx}
              src={url}
              alt={`${title} - extra ${idx + 1}`}
              width={800}
              height={600}
              className="h-24 w-32 shrink-0 rounded-md border object-cover transition-transform group-hover:scale-[1.02] cursor-pointer"
            />
          </button>
        ))}
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80"
          onClick={close}
          aria-modal="true"
          role="dialog"
        >
          {/* Image container */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`${title} - ${index + 1} of ${images.length}`}
              width={1600}
              height={1200}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              loading="lazy"
            />

            {/* Click zones for prev/next */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize bg-transparent"
                  style={{ outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute inset-y-0 right-0 w-1/3 cursor-e-resize bg-transparent"
                  style={{ outline: 'none' }}
                />
              </>
            )}

            {/* Close button */}
            <Button
              size='icon-sm' variant="secondary"
              className="absolute -top-3 right-0 bg-white/90 rounded-full hover:bg-white hover:cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X strokeWidth={3} />
            </Button>
            {/* Prev */}
            {images.length > 1 && (
              <Button
                size="icon-lg"
                variant="secondary"
                className="absolute top-2/5 cursor-pointer h-1/5 bg-white/50 rounded-l"
                onClick={prev}
              >
                <ArrowLeftFromLine strokeWidth={3} />
              </Button>
            )}

            {/* Next */}
            {images.length > 1 && (
              <Button
                size="icon-lg"
                variant="secondary"
                className="absolute top-2/5 right-0 cursor-pointer h-1/5 bg-white/50 rounded-r"
                onClick={next}
              >
                <ArrowRightFromLine strokeWidth={3} />
              </Button>
            )}

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 text-xs text-white">
                {index + 1} / {images.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
