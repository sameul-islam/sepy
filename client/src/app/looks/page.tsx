
import Image from "next/image";
import Link from "next/link";

import { getLooks } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Looks | SEPY",
  description:
    "Discover curated SEPY sport-fashion looks and explore the pieces behind each look.",
};

export default async function LooksPage() {
  let looks;

  try {
    looks = await getLooks();
  } catch (error) {
    console.error("Failed to load Looks:", error);

    return (
      <main className="mx-auto min-h-[60svh] max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <p className="text-sm text-text-secondary">
          Looks could not be loaded right now. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
      <header className="mb-10 sm:mb-14">
        <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-text-muted sm:text-xs">
          SEPY EDITORIAL
        </p>

        <h1 className="mt-3 font-display text-4xl tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
          The Looks
        </h1>

        <p className="mt-4 max-w-lg text-sm leading-6 text-text-secondary sm:text-base">
          Curated combinations. Considered essentials. Find your next look.
        </p>
      </header>

      {looks.length === 0 ? (
        <p className="py-16 text-sm text-text-secondary">
          New looks are coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-6">
          {looks.map((look) => (
            <article key={look._id} className="min-w-0">
              <Link
                href={`/looks/${encodeURIComponent(look.slug)}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-4"
              >
                <div className="relative aspect-4/5 overflow-hidden bg-surface">
                  <Image
                    src={look.image.url}
                    alt={look.image.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02] motion-reduce:transition-none"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted">
                      {look.eyebrow}
                    </p>

                    <h2 className="mt-2 text-lg font-medium tracking-tight text-text-primary sm:text-xl">
                      {look.title}
                    </h2>
                  </div>

                  <span
                    aria-hidden="true"
                    className="pt-1 text-lg text-text-secondary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
