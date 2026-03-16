"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";


type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export default function MainImageDisplay({ src, alt, width, height, className }: Props) {
  const [open, setOpen] = useState(false);

  // manage listeners and body scroll lock when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="block focus:outline-none">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={(className || "") + " cursor-pointer"}
          loading="lazy"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/80 mb-0"
          onClick={() => setOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative max-h-90vh max-w-90vw"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              loading="lazy"
            />
            <Button
              size='icon-sm' variant="secondary"
              className="absolute -top-3 right-0 bg-white/90 rounded-full hover:bg-white hover:cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X strokeWidth={3} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
