import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import TheLookProductCard from "./TheLookProductCard";
import type { TheLookProduct } from "./the-look-types";

type TheLookProductRailProps = {
  products: TheLookProduct[];
  onProgressChange: (progress: number) => void;
};

export default function TheLookProductRail({
  products,
  onProgressChange,
}: TheLookProductRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateProgress = useCallback(() => {
    const rail = railRef.current;

    if (!rail) return;

    const maxScroll = rail.scrollWidth - rail.clientWidth;

    if (maxScroll <= 0) {
      onProgressChange(0);
      return;
    }

    onProgressChange(
      Math.min(Math.max(rail.scrollLeft / maxScroll, 0), 1),
    );
  }, [onProgressChange]);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) return;

    updateProgress();

    rail.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(updateProgress);

    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateProgress);
      resizeObserver.disconnect();
    };
  }, [updateProgress]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    const rail = railRef.current;

    if (!rail) return;

    dragState.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
      moved: false,
    };

    setIsDragging(true);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rail = railRef.current;

    if (!rail || !dragState.current.active) return;

    const distance = event.clientX - dragState.current.startX;

    if (Math.abs(distance) > 5) {
      dragState.current.moved = true;
    }

    if (dragState.current.moved) {
      rail.scrollLeft = dragState.current.startScrollLeft - distance;
    }
  };

  const endDrag = () => {
    if (!dragState.current.active) return;

    dragState.current.active = false;
    setIsDragging(false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.moved) return;

    event.preventDefault();
    event.stopPropagation();

    dragState.current.moved = false;
  };

  return (
    <div
      ref={railRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto overscroll-x-contain select-none scrollbar-none [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex w-max gap-1 sm:gap-2">
        {products.map((product) => (
          <TheLookProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}