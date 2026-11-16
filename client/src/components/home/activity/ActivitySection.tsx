import Image from "next/image";
import Link from "next/link";
import { MdOutlineArrowOutward } from "react-icons/md";

const activities = [
  {
    title: "Gym & Training",
    image: "training.webp",
    activity: "Training",
  },
  {
    title: "Running",
    image: "running.webp",
    activity: "Running",
  },
  {
    title: "Yoga & Studio",
    image: "yoga-studio.webp",
    activity: "Yoga & Studio",
  },
  {
    title: "Everyday Movement",
    image: "everyday-movement.webp",
    activity: "Everyday Movement",
  },
] as const;

export default function ActivitySection() {
  return (
    <section
      aria-labelledby="activity-section-title"
      className="bg-background px-3 py-5 sm:px-5 md:py-10 lg:px-6 xl:px-10"
    >
      <div className="mx-auto w-full">
        <h2
          id="activity-section-title"
          className="mb-3 sm:mb-5 font-bold text-foreground sm:text-xl uppercase"
        >
          Shop by Activity
        </h2>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:h-130 xl:h-145">
          {activities.map((item) => (
            <Link
              key={item.activity}
              href={`/products?activity=${encodeURIComponent(item.activity)}`}
              aria-label={`Explore ${item.title} collection`}
              className="group relative aspect-4/5 min-w-0 overflow-hidden bg-[#eaeae6] outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 lg:aspect-auto lg:flex-1"
            >
              <Image
                src={`/images/activities/${item.image}`}
                alt={`${item.title} activewear`}
                fill
                sizes="(min-width: 1024px) 40vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out"
              />

              {/* Default light overlay */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-white/45 opacity-0 transition-opacity duration-700 lg:opacity-100 lg:group-hover:opacity-0 lg:group-focus-visible:opacity-0"
              />

              {/* Active dark overlay */}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-black/25 opacity-100 transition-opacity duration-700 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
              />

              <div className="absolute inset-x-5 bottom-5 z-10 flex flex-col gap-2 sm:inset-x-6 sm:bottom-6 lg:inset-x-8 lg:bottom-8">
                <h3 className="origin-bottom-left whitespace-nowrap text-lg font-semibold tracking-tight text-white transition-[transform,color] duration-700 ease-out sm:text-xl lg:-rotate-90 lg:text-2xl lg:text-neutral-900 lg:group-hover:text-white lg:group-focus-visible:rotate-0 lg:group-focus-visible:text-white xl:text-3xl">
                  {item.title}
                </h3>

                <span className="flex w-fit items-center gap-2 text-xs font-medium tracking-wide text-white sm:text-sm lg:opacity-0 lg:transition-[opacity,transform] lg:duration-500 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
                  Explore {item.title}
                  <span aria-hidden="true">
                    <MdOutlineArrowOutward size={20} />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
