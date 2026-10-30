const PROGRESS_WIDTH = 20;

type TheLookProgressProps = {
  progress: number;
};

export default function TheLookProgress({
  progress,
}: TheLookProgressProps) {
  return (
    <div className="mt-7 flex items-center justify-center">
      <div
        className="relative h-px w-40 bg-border sm:w-50"
        role="progressbar"
        aria-label="The Look product scroll position"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 bg-foreground motion-reduce:transition-none"
          style={{
            left: `${progress * (100 - PROGRESS_WIDTH)}%`,
            width: `${PROGRESS_WIDTH}%`,
          }}
        />
      </div>
    </div>
  );
}