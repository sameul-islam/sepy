"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { ProductImage } from "@/lib/api-types";
import { RiCloseLargeLine } from "react-icons/ri";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

type ProductDetailGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export default function ProductDetailGallery({
  images,
  productName,
}: ProductDetailGalleryProps) {
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDialogElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  type ZoomState = {
    scale: number;
    x: number;
    y: number;
  };

  const [zoom, setZoom] = useState<ZoomState>({
    scale: 1,
    x: 0,
    y: 0,
  });

  const lastTapRef = useRef<{
    time: number;
    x: number;
    y: number;
  } | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  // Keep the mobile indicator synchronized with the carousel.
  const handleMobileScroll = () => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const slideWidth = track.clientWidth;

    if (!slideWidth) return;

    const nextIndex = Math.round(track.scrollLeft / slideWidth);

    setActiveIndex(Math.min(Math.max(nextIndex, 0), images.length - 1));
  };

  // Navigate to a specific image in the mobile carousel.
  const goToImage = (index: number) => {
    const track = mobileTrackRef.current;

    if (!track) return;

    const slideWidth = track.clientWidth;

    track.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  // Open the fullscreen viewer.
  const openViewer = (index: number) => {
    setViewerIndex(index);
    setIsViewerOpen(true);
  };

  // Close the viewer and synchronize the mobile gallery.
  const closeViewer = () => {
    resetZoom();
    setIsViewerOpen(false);
    setActiveIndex(viewerIndex);

    const track = mobileTrackRef.current;

    if (track?.clientWidth) {
      track.scrollTo({
        left: track.clientWidth * viewerIndex,
        behavior: "smooth",
      });
    }
  };

  // Navigate between images inside the fullscreen viewer.
  const showPreviousImage = () => {
    setViewerIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setViewerIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  const resetZoom = () => {
    setZoom({
      scale: 1,
      x: 0,
      y: 0,
    });

    dragRef.current = null;
    lastTapRef.current = null;
  };

  const toggleZoom = (x = 0, y = 0) => {
    setZoom((current) => {
      if (current.scale > 1) {
        return {
          scale: 1,
          x: 0,
          y: 0,
        };
      }

      return {
        scale: 2.5,
        x,
        y,
      };
    });
  };

  const handleImagePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (zoom.scale <= 1) return;

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: zoom.x,
      originY: zoom.y,
      moved: false,
    };
  };

  const handleImagePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      drag.moved = true;
    }

    setZoom((current) => ({
      ...current,
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    }));
  };

  const handleImagePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (drag && drag.pointerId === event.pointerId) {
      dragRef.current = null;

      if (drag.moved) return;
    }

    if (event.pointerType !== "touch") return;

    const now = Date.now();
    const previousTap = lastTapRef.current;

    if (
      previousTap &&
      now - previousTap.time < 300 &&
      Math.hypot(event.clientX - previousTap.x, event.clientY - previousTap.y) <
        40
    ) {
      const rect = event.currentTarget.getBoundingClientRect();

      const x = (rect.width / 2 - (event.clientX - rect.left)) * 1.5;

      const y = (rect.height / 2 - (event.clientY - rect.top)) * 1.5;

      toggleZoom(x, y);
      lastTapRef.current = null;
      return;
    }

    lastTapRef.current = {
      time: now,
      x: event.clientX,
      y: event.clientY,
    };
  };

  useEffect(() => {
    resetZoom();
  }, [viewerIndex]);

  // Synchronize React state with the native dialog.
  useEffect(() => {
    const dialog = viewerRef.current;

    if (!dialog) return;

    if (isViewerOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isViewerOpen && dialog.open) {
      dialog.close();
    }
  }, [isViewerOpen]);

  // Keyboard navigation.
  useEffect(() => {
    if (!isViewerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isViewerOpen, images.length]);

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-[#f7f7f5]" />;
  }

  const currentImage = images[viewerIndex];

  return (
    <section aria-label={`${productName} product images`} className="min-w-0">
      {/* Mobile Gallery */}
      <div className="md:hidden">
        <div
          ref={mobileTrackRef}
          onScroll={handleMobileScroll}
          className="
            sepy-scrollbar-hidden
            flex w-full snap-x snap-mandatory
            overflow-x-auto scroll-smooth
          "
          aria-label="Swipe to view product images"
        >
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => openViewer(index)}
              aria-label={`Enlarge image ${index + 1} of ${images.length}`}
              className="
                relative aspect-3/4 w-full
                shrink-0 snap-center
                overflow-hidden bg-[#f7f7f5]
                text-left
              "
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} image ${index + 1}`}
                fill
                priority={index === 0}
                sizes="100vw"
                draggable={false}
                className="select-none object-cover"
              />
            </button>
          ))}
        </div>

        {/* Mobile Image Indicators */}
        {images.length > 1 && (
          <div
            className="relative flex w-full items-center"
            role="group"
            aria-label="Select product image"
          >
            {images.map((image, index) => (
              <button
                key={`${image.url}-${index}-indicator`}
                type="button"
                onClick={() => goToImage(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className="
                  relative flex-1
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-[#171717]
                "
              >
                <span className="block h-0.5 w-full bg-[#deded8]" />
              </button>
            ))}

            {/* Active Indicator */}
            <span
              className="
                absolute left-0 top-1/2
                h-0.5 bg-[#171717]
                transition-transform duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
              "
              style={{
                width: `${100 / images.length}%`,
                transform: `translateX(${activeIndex * 100}%)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Desktop Gallery */}
      <div
        className="
          hidden grid-cols-1 lg:grid-cols-2 items-start
          gap-1
          md:grid
        "
      >
        {images.map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            onClick={() => openViewer(index)}
            aria-label={`Enlarge image ${index + 1} of ${images.length}`}
            className="
              relative aspect-3/4 w-full
              overflow-hidden bg-[#f7f7f5]
              text-left
            "
          >
            <Image
              src={image.url}
              alt={image.alt || `${productName} image ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 30vw, 50vw"
              draggable={false}
              className="
                object-cover
                cursor-zoom-in
              "
            />
          </button>
        ))}
      </div>

      {/* Fullscreen Image Viewer */}
      <dialog
        ref={viewerRef}
        aria-label={`${productName} image viewer`}
        onCancel={(event) => {
          event.preventDefault();
          closeViewer();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeViewer();
          }
        }}
        onClose={() => setIsViewerOpen(false)}
        className="
          fixed inset-0
          m-0 h-dvh w-screen
          max-h-none max-w-none
          border-0 p-0
          bg-[#f5f5f5] text-accent
          backdrop:bg-white/80
          open:flex open:flex-col
        "
      >
        {/* Viewer Header */}
        <div
          className="
          relative z-10 flex h-16 shrink-0
          items-center justify-between
          px-5 sm:px-8
        "
        >
          <span className="text-xs tabular-nums text-black font-bold bg-white/80 p-1.5 rounded-full">
            {viewerIndex + 1} / {images.length}
          </span>

          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close image viewer"
            className="
              flex size-10 items-center justify-center
              text-3xl text-black bg-white/80 rounded-full cursor-pointer
              transition-opacity hover:opacity-60
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-black
            "
          >
            <RiCloseLargeLine size={17} />
          </button>
        </div>

        {/* Main Image */}
        <div
          className="
          relative min-h-0 flex-1
          overflow-hidden

        "
        >
          <div
            className="
    relative h-full w-full
    touch-none overflow-hidden
    cursor-grab
    active:cursor-grabbing
  "
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={handleImagePointerUp}
            onPointerCancel={() => {
              dragRef.current = null;
            }}
            onDoubleClick={() => toggleZoom()}
          >
            {currentImage && (
              <Image
                key={currentImage.url}
                src={currentImage.url}
                alt={
                  currentImage.alt || `${productName} image ${viewerIndex + 1}`
                }
                fill
                priority
                sizes="100vw"
                draggable={false}
                className="
        select-none object-contain
        transition-transform duration-300
        ease-out
      "
                style={{
                  transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                }}
              />
            )}
          </div>

          {/* Previous Image */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Previous image"
              className="
                absolute left-2 top-1/2
                flex size-10 -translate-y-1/2
                items-center justify-center
                rounded-full bg-white/70     
                transition-colors hover:bg-white/80
                sm:left-5 sm:size-12 cursor-pointer
              "
            >
              <MdArrowBackIosNew size={17} />
            </button>
          )}

          {/* Next Image */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Next image"
              className="
                absolute right-2 top-1/2
                flex size-10 -translate-y-1/2
                items-center justify-center
                rounded-full bg-white/70
                transition-colors hover:bg-white/80
                sm:right-5 sm:size-12 cursor-pointer
              "
            >
              <MdArrowForwardIos size={17} />
            </button>
          )}
        </div>
      </dialog>
    </section>
  );
}
