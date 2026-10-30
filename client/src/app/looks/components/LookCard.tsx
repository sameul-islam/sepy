
import Link from "next/link";

import LookCardImage from "./LookCardImage";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";

export type LookCardData = {
  _id: string;
  slug: string;
  title: string;
  image: {
    url: string;
    alt: string;
  };
};

type Props = {
  look: LookCardData;
};

export default function LookCard({ look }: Props) {
  return (
    <article className="min-w-0">
      <Link
        href={`/looks/${encodeURIComponent(look.slug)}`}
        aria-label={`Explore ${look.title}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-4"
      >
        <LookCardImage
          src={look.image.url}
          alt={look.image.alt}
        />

        <div className="flex items-center justify-between">
          <h2 className="mt-2 p-2 text-sm font-bold text-text-primary">
            {look.title}
          </h2>

          <span
            aria-hidden="true"
            className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-text-primary transition-colors duration-300 group-hover:bg-text-primary group-hover:text-white"
          >
            <LiaLongArrowAltRightSolid size={14} strokeWidth={1.5} />
          </span>
        </div>
      </Link>
    </article>
  );
}
