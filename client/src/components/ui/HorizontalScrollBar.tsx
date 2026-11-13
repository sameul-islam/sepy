"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";

type HorizontalScrollBarProps = {
  scrollRef: RefObject<HTMLDivElement | null>;
  scrollId: string;
  ariaLabel: string;
};

export default function HorizontalScrollBar({
  scrollRef,
  scrollId,
  ariaLabel,
}: HorizontalScrollBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<number | null>(null);

  const dragState = useRef({
    pointerId: -1,
    offsetX: 0,
  });

  const updateScrollState = useCallback(() => {
    const rail = scrollRef.current;

    if (!rail) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const hasOverflow = maxScroll > 1;

    setCanScroll(hasOverflow);

    setProgress(
      hasOverflow ? Math.min(1, Math.max(0, rail.scrollLeft / maxScroll)) : 0,
    );
  }, [scrollRef]);

  const handleScroll = useCallback(() => {
    updateScrollState();
    setIsScrolling(true);

    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, 700);
  }, [updateScrollState]);

  useEffect(() => {
    const rail = scrollRef.current;

    if (!rail) return;

    updateScrollState();

    rail.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateScrollState);

    resizeObserver.observe(rail);

    Array.from(rail.children).forEach((child) => {
      resizeObserver.observe(child);
    });

    return () => {
      rail.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [scrollRef, updateScrollState, handleScroll]);

  const updateRailFromPointer = (clientX: number) => {
    const rail = scrollRef.current;
    const track = trackRef.current;

    if (!rail || !track) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;
    const availableDistance = track.clientWidth * 0.75;

    if (maxScroll <= 0 || availableDistance <= 0) return;

    const trackLeft = track.getBoundingClientRect().left;
    const rawPosition = clientX - trackLeft - dragState.current.offsetX;

    const position = Math.min(availableDistance, Math.max(0, rawPosition));

    rail.scrollLeft = (position / availableDistance) * maxScroll;
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary) return;

    const track = trackRef.current;

    if (!track) return;

    const thumb = track.querySelector("[data-scroll-thumb]");
    const isThumbTarget = thumb?.contains(event.target as Node) ?? false;

    const thumbRect = thumb?.getBoundingClientRect();

    dragState.current = {
      pointerId: event.pointerId,
      offsetX:
        isThumbTarget && thumbRect
          ? event.clientX - thumbRect.left
          : track.clientWidth * 0.125,
    };

    track.setPointerCapture(event.pointerId);

    if (!isThumbTarget) {
      updateRailFromPointer(event.clientX);
    }

    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;

    updateRailFromPointer(event.clientX);
  };

  const endPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current.pointerId !== event.pointerId) return;

    dragState.current.pointerId = -1;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rail = scrollRef.current;

    if (!rail) return;

    const step = rail.clientWidth * 0.8;

    switch (event.key) {
      case "ArrowRight":
        rail.scrollBy({ left: step, behavior: "smooth" });
        break;

      case "ArrowLeft":
        rail.scrollBy({ left: -step, behavior: "smooth" });
        break;

      case "Home":
        rail.scrollTo({ left: 0, behavior: "smooth" });
        break;

      case "End":
        rail.scrollTo({
          left: rail.scrollWidth,
          behavior: "smooth",
        });
        break;

      case "PageDown":
        rail.scrollBy({
          left: rail.clientWidth,
          behavior: "smooth",
        });
        break;

      case "PageUp":
        rail.scrollBy({
          left: -rail.clientWidth,
          behavior: "smooth",
        });
        break;

      default:
        return;
    }

    event.preventDefault();
  };

  if (!canScroll) return null;

  return (
    <div
      className={`mt-3 md:mt-5 flex justify-center transition-opacity duration-300 ${
        isScrolling
          ? "opacity-30 sm:opacity-100"
          : "opacity-0 sm:group-hover/new-arrivals:opacity-40"
      } pointer-events-none sm:group-hover/new-arrivals:pointer-events-auto`}
    >
      <div
        ref={trackRef}
        role="scrollbar"
        aria-label={ariaLabel}
        aria-controls={scrollId}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={`${Math.round(progress * 100)}% scrolled`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onLostPointerCapture={() => {
          dragState.current.pointerId = -1;
        }}
        onKeyDown={handleKeyDown}
        className="relative flex h-5 w-full touch-none cursor-grab items-center outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-4"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-0.5 md:h-1 -translate-y-1/2 bg-gray-100 rounded-full"
        />

        <span
          data-scroll-thumb
          aria-hidden="true"
          className="absolute top-1/2 h-1 md:h-1.5 w-1/4 -translate-y-1/2 bg-gray-400 rounded-full"
          style={{
            left: `${progress * 75}%`,
          }}
        />
      </div>
    </div>
  );
}
