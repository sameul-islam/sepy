"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

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
  const imageElementRef = useRef<HTMLImageElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false);

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

  const activePointersRef = useRef(new Map<number, { x: number; y: number }>());

  const pointerStartRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const pinchRef = useRef<{
    distance: number;
    scale: number;
    x: number;
    y: number;
    midpointX: number;
    midpointY: number;
  } | null>(null);

  const resetZoom = useCallback(() => {
    setZoom({
      scale: 1,
      x: 0,
      y: 0,
    });

    activePointersRef.current.clear();
    pointerStartRef.current = null;
    pinchRef.current = null;
    lastTapRef.current = null;
  }, []);

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
    setIsViewerImageLoaded(false);
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
  const showPreviousImage = useCallback(() => {
    resetZoom();
    setIsViewerImageLoaded(false);

    setViewerIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }, [images.length, resetZoom, setIsViewerImageLoaded, setViewerIndex]);

  const showNextImage = useCallback(() => {
    resetZoom();
    setIsViewerImageLoaded(false);

    setViewerIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }, [images.length, resetZoom, setIsViewerImageLoaded, setViewerIndex]);

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2.5;

  const getDistance = (
    first: { x: number; y: number },
    second: { x: number; y: number },
  ) => {
    return Math.hypot(second.x - first.x, second.y - first.y);
  };

  const getMidpoint = (
    first: { x: number; y: number },
    second: { x: number; y: number },
  ) => ({
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  });

  const clampPan = (
    x: number,
    y: number,
    scale: number,
    container: HTMLDivElement,
  ) => {
    const image = imageElementRef.current;

    // Image dimensions are not available yet.
    if (!image?.naturalWidth || !image.naturalHeight) {
      return { x: 0, y: 0 };
    }

    const { width, height } = container.getBoundingClientRect();

    const imageAspectRatio = image.naturalWidth / image.naturalHeight;

    // Calculate the actual rendered dimensions
    // when object-fit is set to contain.
    const renderedWidth = Math.min(width, height * imageAspectRatio);

    const renderedHeight = Math.min(height, width / imageAspectRatio);

    // Calculate the maximum permitted pan distance.
    const maxX = Math.max(0, (renderedWidth * scale - width) / 2);

    const maxY = Math.max(0, (renderedHeight * scale - height) / 2);

    // Keep the image within its permitted boundaries.
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  };

  const toggleZoomAt = (
    clientX: number,
    clientY: number,
    element: HTMLDivElement,
  ) => {
    const rect = element.getBoundingClientRect();

    setZoom((current) => {
      if (current.scale > MIN_ZOOM) {
        return {
          scale: MIN_ZOOM,
          x: 0,
          y: 0,
        };
      }

      const scale = MAX_ZOOM;

      const pointX = clientX - rect.left - rect.width / 2;
      const pointY = clientY - rect.top - rect.height / 2;

      const nextX = pointX * (1 - scale);
      const nextY = pointY * (1 - scale);

      const bounded = clampPan(nextX, nextY, scale, element);

      return {
        scale,
        ...bounded,
      };
    });
  };

  const handleImagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);

    const point = {
      x: event.clientX,
      y: event.clientY,
    };

    if (event.pointerType === "touch") {
      activePointersRef.current.set(event.pointerId, point);

      const pointers = Array.from(activePointersRef.current.values());

      if (pointers.length >= 2) {
        const first = pointers[0];
        const second = pointers[1];

        const midpoint = getMidpoint(first, second);
        const rect = event.currentTarget.getBoundingClientRect();

        pinchRef.current = {
          distance: getDistance(first, second),
          scale: zoom.scale,
          x: zoom.x,
          y: zoom.y,
          midpointX: midpoint.x - rect.left - rect.width / 2,
          midpointY: midpoint.y - rect.top - rect.height / 2,
        };

        pointerStartRef.current = null;
        lastTapRef.current = null;
        return;
      }
    }

    pointerStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: zoom.x,
      originY: zoom.y,
      moved: false,
    };
  };

  const handleImagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const point = {
      x: event.clientX,
      y: event.clientY,
    };

    if (event.pointerType === "touch") {
      activePointersRef.current.set(event.pointerId, point);
    }

    const pinch = pinchRef.current;

    // Mobile: Two-finger pinch-to-zoom.
    if (
      event.pointerType === "touch" &&
      pinch &&
      activePointersRef.current.size >= 2
    ) {
      const pointers = Array.from(activePointersRef.current.values());

      const first = pointers[0];
      const second = pointers[1];

      const distance = getDistance(first, second);
      const midpoint = getMidpoint(first, second);
      const rect = event.currentTarget.getBoundingClientRect();

      const scale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, pinch.scale * (distance / pinch.distance)),
      );

      const currentMidpointX = midpoint.x - rect.left - rect.width / 2;

      const currentMidpointY = midpoint.y - rect.top - rect.height / 2;

      if (scale <= MIN_ZOOM) {
        setZoom({
          scale: MIN_ZOOM,
          x: 0,
          y: 0,
        });

        return;
      }

      const nextX =
        pinch.x +
        (pinch.scale - scale) * pinch.midpointX +
        (currentMidpointX - pinch.midpointX);

      const nextY =
        pinch.y +
        (pinch.scale - scale) * pinch.midpointY +
        (currentMidpointY - pinch.midpointY);

      const bounded = clampPan(nextX, nextY, scale, event.currentTarget);

      setZoom({
        scale,
        ...bounded,
      });

      return;
    }

    // One-finger or mouse drag while zoomed.
    const drag = pointerStartRef.current;

    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      drag.moved = true;
    }

    if (zoom.scale <= MIN_ZOOM) return;

    const container = event.currentTarget;

    setZoom((current) => {
      const bounded = clampPan(
        drag.originX + deltaX,
        drag.originY + deltaY,
        current.scale,
        container,
      );

      return {
        ...current,
        ...bounded,
      };
    });
  };

  const handleImagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = pointerStartRef.current;

    if (event.pointerType === "touch") {
      activePointersRef.current.delete(event.pointerId);

      // Finish the current pinch gesture.
      if (pinchRef.current) {
        pinchRef.current = null;
        lastTapRef.current = null;

        // Allow the remaining finger to continue panning.
        const remaining = Array.from(activePointersRef.current.entries())[0];

        if (remaining) {
          pointerStartRef.current = {
            pointerId: remaining[0],
            x: remaining[1].x,
            y: remaining[1].y,
            originX: zoom.x,
            originY: zoom.y,
            moved: false,
          };
        } else {
          pointerStartRef.current = null;
        }

        return;
      }

      if (drag?.pointerId === event.pointerId) {
        pointerStartRef.current = null;

        if (drag.moved) {
          // Navigate only when the image is not zoomed.
          if (zoom.scale <= MIN_ZOOM) {
            const deltaX = event.clientX - drag.x;
            const deltaY = event.clientY - drag.y;

            const isHorizontalSwipe =
              Math.abs(deltaX) >= 50 &&
              Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

            if (isHorizontalSwipe) {
              if (deltaX < 0) {
                showNextImage();
              } else {
                showPreviousImage();
              }
            }
          }

          return;
        }
      }

      // Mobile: Double-tap zoom.
      const now = Date.now();
      const previousTap = lastTapRef.current;

      if (
        previousTap &&
        now - previousTap.time < 300 &&
        Math.hypot(
          event.clientX - previousTap.x,
          event.clientY - previousTap.y,
        ) < 40
      ) {
        toggleZoomAt(event.clientX, event.clientY, event.currentTarget);

        lastTapRef.current = null;
        return;
      }

      lastTapRef.current = {
        time: now,
        x: event.clientX,
        y: event.clientY,
      };

      return;
    }

    // Desktop: Click to zoom in/out, drag to pan.
    if (event.pointerType === "mouse") {
      if (drag?.pointerId === event.pointerId) {
        pointerStartRef.current = null;

        if (drag.moved) return;
      }

      toggleZoomAt(event.clientX, event.clientY, event.currentTarget);
    }
  };

  const handleImagePointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    activePointersRef.current.delete(event.pointerId);

    pointerStartRef.current = null;
    pinchRef.current = null;
    lastTapRef.current = null;
  };

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
  }, [isViewerOpen, images.length, showNextImage, showPreviousImage]);

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
          bg-[#111111] text-white
          backdrop:bg-black/90
          open:block
        "
      >
        {/* Viewer Header — Overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-x-0 top-0 z-20
            flex h-16 items-center justify-end
            px-5 sm:px-8
          "
        >
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close image viewer"
            className="
              pointer-events-auto
              flex size-10 items-center justify-center
              cursor-pointer
              text-white
              transition-opacity duration-200
              hover:opacity-60
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
            "
          >
            <RiCloseLargeLine size={22} />
          </button>
        </div>

        {/* Main Image — Full Viewport */}
        <div
          className="
            absolute inset-0
            overflow-hidden
          "
        >
          <div
            className={`
              relative h-full w-full
              touch-none overflow-hidden
              ${
                zoom.scale > 1
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-zoom-in"
              }
            `}
            onPointerDown={handleImagePointerDown}
            onPointerMove={handleImagePointerMove}
            onPointerUp={handleImagePointerUp}
            onPointerCancel={handleImagePointerCancel}
          >
            {currentImage && (
              <Image
                key={currentImage.url}
                ref={imageElementRef}
                src={currentImage.url}
                alt={
                  currentImage.alt || `${productName} image ${viewerIndex + 1}`
                }
                fill
                priority
                sizes="100vw"
                draggable={false}
                onLoad={() => setIsViewerImageLoaded(true)}
                className="
                  select-none object-contain
                  transition-[opacity,transform]
                  duration-300 ease-out
                "
                style={{
                  opacity: isViewerImageLoaded ? 1 : 0,
                  transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                }}
              />
            )}
          </div>
        </div>

        {/* Viewer Navigation — Overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0 z-20
            flex h-16 items-center justify-center
            px-5 sm:h-20 sm:px-8
          "
        >
          {/* Mobile Dot Indicators */}
          {images.length > 1 && (
            <div
              className="
                pointer-events-auto
                flex items-center justify-center gap-2
                md:hidden
              "
              role="group"
              aria-label="Select product image"
            >
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}-viewer-dot`}
                  type="button"
                  onClick={() => {
                    if (viewerIndex === index) return;

                    resetZoom();
                    setIsViewerImageLoaded(false);
                    setViewerIndex(index);
                  }}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-current={viewerIndex === index ? "true" : undefined}
                  className="
                    flex size-6 items-center justify-center
                    rounded-full
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-white
                  "
                >
                  <span
                    className={`
                      size-2 rounded-full border
                      transition-colors duration-200
                      ${
                        viewerIndex === index
                          ? "border-white bg-white"
                          : "border-white/60 bg-transparent"
                      }
                    `}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Desktop Navigation */}
          {images.length > 1 && (
            <div
              className="
                pointer-events-auto
                hidden items-center justify-center
                gap-8 md:flex
              "
            >
              {/* Previous */}
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous image"
                className="
                  flex size-10 items-center justify-center
                  cursor-pointer text-white
                  transition-opacity duration-200
                  hover:opacity-60
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                <MdArrowBackIosNew size={17} />
              </button>

              {/* Image Counter */}
              <span
                className="
                  min-w-12 text-center
                  text-xs font-semibold
                  tabular-nums tracking-wide
                  text-white
                "
                aria-live="polite"
              >
                {viewerIndex + 1} / {images.length}
              </span>

              {/* Next */}
              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next image"
                className="
                  flex size-10 items-center justify-center
                  cursor-pointer text-white
                  transition-opacity duration-200
                  hover:opacity-60
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                <MdArrowForwardIos size={17} />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </section>
  );
}
