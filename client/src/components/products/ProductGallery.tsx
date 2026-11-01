"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";

import type { ProductImage } from "@/lib/api-types";

const MAX_GALLERY_IMAGES = 5;

// Drag / swipe tuning
const DRAG_START_THRESHOLD = 8;
const SWIPE_DISTANCE = 40;
const FLICK_DISTANCE = 20;
const FLICK_TIME = 250;
const EDGE_RESISTANCE = 0.35;

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
  productHref?: string;
  /** Set true only for the actual LCP / priority product image. */
  priority?: boolean;
};

type PointerStart = {
  x: number;
  y: number;
  time: number;
  pointerId: number;
};

type ArrowButtonProps = {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
};

function ArrowButton({ direction, disabled, onClick }: ArrowButtonProps) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        isPrevious ? "Show previous product image" : "Show next product image"
      }
      className={`
        absolute top-1/2 z-10 hidden size-9 -translate-y-1/2
        items-center justify-center rounded-sm border border-gray-300
        bg-white/70 text-[#171717] 
        opacity-0 transition-opacity duration-200
        hover:bg-white
        focus-visible:opacity-100
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[#171717]
        disabled:cursor-not-allowed
        disabled:text-gray-300
        group-hover/gallery:opacity-100
        [@media(hover:hover)_and_(pointer:fine)]:flex
        ${isPrevious ? "left-2" : "right-2"}
      `}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
      >
        <path
          d={isPrevious ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function ProductGallery({
  images,
  productName,
  productHref,
  priority = false,
}: ProductGalleryProps) {
  // A maximum of five images keeps the gallery lightweight.
  const galleryImages = images.slice(0, MAX_GALLERY_IMAGES);
  const lastIndex = galleryImages.length - 1;

  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);

  const pointerStart = useRef<PointerStart | null>(null);
  const dragging = useRef(false);
  const suppressClick = useRef(false);

  const latestOffset = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Keep the active index valid if the image list changes.
  const activeIndex = Math.min(index, Math.max(lastIndex, 0));

  const getTrackTransform = useCallback(
    (slideIndex: number, offset = 0) =>
      `translate3d(calc(${-slideIndex * 100}% + ${offset}px), 0, 0)`,
    [],
  );

  const cancelPendingFrame = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Update the track at most once per animation frame.
  // Pointer movement does not trigger React re-renders.
  const updateDragPosition = useCallback(
    (offset: number) => {
      latestOffset.current = offset;

      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = getTrackTransform(
            activeIndex,
            latestOffset.current,
          );
        }

        animationFrameRef.current = null;
      });
    },
    [activeIndex, getTrackTransform],
  );

  useEffect(() => {
    return () => {
      cancelPendingFrame();
    };
  }, [cancelPendingFrame]);

  const goTo = (nextIndex: number) => {
    if (dragging.current) return;

    const safeIndex = Math.min(Math.max(nextIndex, 0), lastIndex);

    if (safeIndex === activeIndex) return;

    setIndex(safeIndex);
  };

  const showNext = () => goTo(activeIndex + 1);
  const showPrevious = () => goTo(activeIndex - 1);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || dragging.current) {
      return;
    }

    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      pointerId: event.pointerId,
    };

    suppressClick.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;

    if (!start || event.pointerId !== start.pointerId) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (!dragging.current) {
      if (
        Math.abs(deltaX) < DRAG_START_THRESHOLD &&
        Math.abs(deltaY) < DRAG_START_THRESHOLD
      ) {
        return;
      }

      // Let the browser handle vertical page scrolling.
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        pointerStart.current = null;
        return;
      }

      dragging.current = true;
      latestOffset.current = 0;

      // Capture mouse pointer after horizontal dragging is confirmed.
      // Touch behavior remains unchanged.
      if (event.pointerType === "mouse") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      // Disable CSS transition while the user is dragging.
      if (trackRef.current) {
        trackRef.current.style.transition = "none";
      }

      setIsDragging(true);
    }

    const pullingPastStart = activeIndex === 0 && deltaX > 0;

    const pullingPastEnd = activeIndex === lastIndex && deltaX < 0;

    const offset =
      pullingPastStart || pullingPastEnd ? deltaX * EDGE_RESISTANCE : deltaX;

    updateDragPosition(offset);
  };

  const finishDrag = (
    event: PointerEvent<HTMLDivElement>,
    shouldNavigate: boolean,
  ) => {
    const start = pointerStart.current;

    if (!start || event.pointerId !== start.pointerId) {
      return;
    }

    const wasDragging = dragging.current;

    const deltaX = event.clientX - start.x;
    const elapsed = event.timeStamp - start.time;

    pointerStart.current = null;
    dragging.current = false;

    cancelPendingFrame();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!wasDragging) return;

    // Suppress the click generated after a completed drag.
    suppressClick.current = shouldNavigate;

    const isFlick = elapsed < FLICK_TIME && Math.abs(deltaX) > FLICK_DISTANCE;

    const shouldChangeSlide =
      shouldNavigate && (Math.abs(deltaX) >= SWIPE_DISTANCE || isFlick);

    let nextIndex = activeIndex;

    if (shouldChangeSlide) {
      if (deltaX < 0 && activeIndex < lastIndex) {
        nextIndex = activeIndex + 1;
      } else if (deltaX > 0 && activeIndex > 0) {
        nextIndex = activeIndex - 1;
      }
    }

    latestOffset.current = 0;

    // Restore the CSS transition before the final track position changes.
    if (trackRef.current) {
      trackRef.current.style.transition = "";
    }

    setIsDragging(false);

    if (nextIndex !== activeIndex) {
      setIndex(nextIndex);
    } else {
      // React does not know about the manually changed transform.
      // Restore it after the drag-state render restores the CSS transition.
      requestAnimationFrame(() => {
        if (trackRef.current) {
          trackRef.current.style.transform = getTrackTransform(activeIndex);
        }
      });
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag(event, true);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    finishDrag(event, false);
  };

  const handleLostPointerCapture = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current) {
      finishDrag(event, false);
    }
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;

    event.preventDefault();
    event.stopPropagation();

    suppressClick.current = false;
  };

  if (galleryImages.length === 0) {
    return <div className="aspect-3/4 bg-[#f7f7f5]" />;
  }

  const track = (
    <div
      ref={trackRef}
      className={`
        flex h-full w-full will-change-transform
        transition-transform duration-300
        ease-[cubic-bezier(0.22,1,0.36,1)]
        motion-reduce:transition-none
        ${isDragging ? "transition-none" : ""}
      `}
      style={{
        transform: getTrackTransform(activeIndex),
      }}
    >
      {galleryImages.map((image, imageIndex) => {
        const isActive = imageIndex === activeIndex;
        const isPriorityImage = priority && imageIndex === 0;

        return (
          <div
            key={`${image.url}-${imageIndex}`}
            className="relative h-full w-full shrink-0"
            aria-hidden={!isActive}
          >
            <Image
              src={image.url}
              alt={isActive ? image.alt || productName : ""}
              fill
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
              preload={isPriorityImage}
              loading={isPriorityImage ? undefined : "lazy"}
              draggable={false}
              className="select-none object-cover"
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className="group/gallery min-w-0"
      role="group"
      aria-roledescription="carousel"
      aria-label={`${productName} images`}
    >
      {/* Image area and desktop navigation arrows */}
      <div className="relative">
        <div
          className={`
            relative aspect-3/4 touch-pan-y
            select-none overflow-hidden bg-[#f7f7f5]
            ${isDragging ? "cursor-grabbing" : "cursor-grab"}
          `}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handleLostPointerCapture}
          onClickCapture={handleClickCapture}
        >
          {productHref ? (
            <Link
              href={productHref}
              draggable={false}
              aria-label={`View ${productName}`}
              className="absolute inset-0 block"
            >
              {track}
            </Link>
          ) : (
            <div className="absolute inset-0">{track}</div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <>
            <ArrowButton
              direction="previous"
              onClick={showPrevious}
              disabled={activeIndex === 0 || isDragging}
            />

            <ArrowButton
              direction="next"
              onClick={showNext}
              disabled={activeIndex === lastIndex || isDragging}
            />
          </>
        )}
      </div>

      {/* Image indicators */}
      {galleryImages.length > 1 && (
        <div
          className="flex items-center justify-center pt-1"
          role="group"
          aria-label="Product image navigation"
        >
          {galleryImages.map((image, imageIndex) => (
            <button
              key={`${image.url}-${imageIndex}-dot`}
              type="button"
              onClick={() => goTo(imageIndex)}
              disabled={isDragging}
              aria-label={`Show product image ${imageIndex + 1}`}
              aria-current={imageIndex === activeIndex ? "true" : undefined}
              className="group/dot flex h-2 sm:h-4 items-center px-1"
            >
              <span
                className={`
                  block h-px sm:h-0.5 rounded-full transition-all duration-200
                  ${
                    imageIndex === activeIndex
                      ? " w-4 sm:w-8 bg-[#171717]"
                      : "w-2 sm:w-5 bg-[#cfcfc8] group-hover/dot:bg-[#85857e]"
                  }
                `}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
