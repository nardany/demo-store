"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { FALLBACK_IMAGE, isExternalImage } from "@/lib/products";

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const source = images && images.length > 0
    ? images
    : [FALLBACK_IMAGE];

  const [index, setIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const previous = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + source.length) % source.length);
  }, [source.length]);

  const next = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % source.length);
  }, [source.length]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!modalOpen) return;
      if (event.key === "Escape") setModalOpen(false);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen, previous, next]);

  return (
    <section className="space-y-4" aria-label="Ապրանքի լուսանկարների պատկերասրահ">

      <div
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setModalOpen(true); } }}
        role="button"
        tabIndex={0}
        aria-label="Մեծացնել լուսանկարը"
        className="relative aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 dark:border-steel-900 dark:bg-steel-900 cursor-pointer transition-colors"
        title="Սեղմեք լուսանկարը մեծացնելու համար"
      >
        <Image
          src={source[index]}
          unoptimized={isExternalImage(source[index])}
          alt={`${title} — Նկար ${index + 1}`}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        <div className="absolute top-4 right-4 z-10 p-2.5 rounded-md bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 flex items-center justify-center pointer-events-none">
          <Expand className="w-4 h-4 text-white" />
        </div>

        {source.length > 1 && (
          <>
            <button
              onClick={previous}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-md bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 opacity-90 hover:opacity-100"
              aria-label="Նախորդ լուսանկար"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-md bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/10 opacity-90 hover:opacity-100"
              aria-label="Հաջորդ լուսանկար"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>

            <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-bold text-stone-100 border border-white/10 pointer-events-none">
              {index + 1} / {source.length}
            </div>
          </>
        )}
      </div>

      {source.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 [&::-webkit-scrollbar]:hidden">
          {source.map((imgUrl, imgIndex) => (
            <button
              key={imgUrl + imgIndex}
              onClick={() => setIndex(imgIndex)}
              className={`relative h-20 w-20 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                index === imgIndex
                  ? "border-steel-700 dark:border-blaze-400"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={imgUrl}
                unoptimized={isExternalImage(imgUrl)}
                alt=""
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {modalOpen && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 w-screen h-screen z-[999999] flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-2xl overflow-hidden select-none"
        >
          <div className="w-full max-w-7xl flex items-center justify-between z-20 text-white pb-2 pt-1">
            <div className="text-xs sm:text-sm font-bold truncate max-w-[75%] bg-black/60 px-4 py-2 rounded-md border border-white/10">
              {title} ({index + 1} / {source.length})
            </div>

            <button
              onClick={() => setModalOpen(false)}
              autoFocus
              className="p-3 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 text-xs font-bold"
              aria-label="Փակել"
            >
              <X className="w-5 h-5 text-white" />
              <span>Փակել</span>
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-7xl flex items-center justify-center my-auto overflow-hidden">
            <Image
              src={source[index]}
              unoptimized={isExternalImage(source[index])}
              alt={`${title} — Մեծացված նկար ${index + 1}`}
              fill
              className="object-contain cursor-pointer"
              onClick={next}
              sizes="100vw"
              priority
            />

            {source.length > 1 && (
              <>
                <button
                  onClick={previous}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-md bg-black/60 text-white hover:bg-black/80 border border-white/10 transition-all"
                  aria-label="Նախորդ լուսանկար"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>

                <button
                  onClick={next}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-md bg-black/60 text-white hover:bg-black/80 border border-white/10 transition-all"
                  aria-label="Հաջորդ լուսանկար"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}
          </div>

          {source.length > 1 && (
            <div className="z-20 flex items-center gap-2.5 pt-3 overflow-x-auto max-w-full [&::-webkit-scrollbar]:hidden py-1">
              {source.map((imgUrl, imgIndex) => (
                <button
                  key={"modal-" + imgUrl + imgIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(imgIndex);
                  }}
                  className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                    index === imgIndex
                      ? "border-blaze-400"
                      : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imgUrl}
                    unoptimized={isExternalImage(imgUrl)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}

        </div>,
        document.body
      )}

    </section>
  );
}
