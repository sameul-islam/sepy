import { getLooks } from "@/lib/api";

import LooksBanner from "./components/LookBanner";
import LookCard, { type LookCardData } from "./components/LookCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Looks | SEPY",
  description:
    "Discover curated SEPY sport-fashion looks and explore the pieces behind each look.",
};

export default async function LooksPage() {
  let looks: LookCardData[];

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
    <main className="mx-auto min-h-screen w-full px-2 pb-20 pt-12 md:px-5 sm:pt-16 lg:pt-20">
      <div className="relative">
      <LooksBanner />

      <header className="mb-10 sm:mb-14">
        <div>
          <h1 className="mt-3 font-display text-center text-4xl tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            The Look Book
          </h1>
        </div>
      </header>
      </div>

      {looks.length === 0 ? (
        <p className="py-16 text-sm text-text-secondary">
          New looks are coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-0.5 gap-y-10 sm:grid-cols-2 sm:gap-y-14 lg:grid-cols-3">
          {looks.map((look) => (
            <LookCard key={look._id} look={look} />
          ))}
        </div>
      )}
    </main>
  );
}
