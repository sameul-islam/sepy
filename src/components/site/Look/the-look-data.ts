export type TheLookProduct = {
  id: string;
  title: string;
  slug: string;
  image: string;
};

export type TheLookData = {
  eyebrow: string;
  title: string;
  modelImage: string;
  products: TheLookProduct[];
};

export const theLook: TheLookData = {
  eyebrow: "The Look",
  title: "Movement, styled.",

  modelImage:
    "/images/looks/the-look.webp",

  products: [
    {
      id: "women-performance-cap",
      title: "Performance Cap",
      slug: "women-performance-cap",
      image:
        "/images/looks/cap.webp",
    },
    {
      id: "women-performance-top",
      title: "Performance Top",
      slug: "women-performance-top",
      image:
        "/images/looks/top-inner.webp",
    },
    {
      id: "women-essential-training-top",
      title: "Essential Training Top",
      slug: "women-essential-training-top",
      image:
        "/images/looks/top-outer.webp",
    },
    {
      id: "women-performance-bottom",
      title: "Performance Bottom",
      slug: "women-performance-bottom",
      image:
        "/images/looks/bottom.webp",
    },
  ],
};