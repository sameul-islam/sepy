
export default function LooksLoading() {
  return (
    <main className="mx-auto min-h-screen w-full px-2 pb-20 pt-12 md:px-5 sm:pt-16 lg:pt-20">
      <div className="mb-10 aspect-5/3 animate-pulse bg-surface-muted sm:mb-14 sm:aspect-16/5" />

      <header className="mb-10 sm:mb-14">
        <div className="h-3 w-24 animate-pulse bg-surface-muted" />
        <div className="mt-4 h-12 w-52 animate-pulse bg-surface-muted sm:h-14 sm:w-64" />
        <div className="mt-5 h-4 w-72 max-w-full animate-pulse bg-surface-muted" />
      </header>

      <div className="grid grid-cols-1 gap-x-0.5 gap-y-10 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="min-w-0">
            <div className="aspect-4/5 animate-pulse bg-surface-muted" />
            <div className="mt-3 h-4 w-28 animate-pulse bg-surface-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}
