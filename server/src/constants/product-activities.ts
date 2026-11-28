export const PRODUCT_ACTIVITIES = [
  "Training",
  "Running",
  "Yoga & Studio",
  "Everyday Movement",
] as const;

export type ProductActivity = (typeof PRODUCT_ACTIVITIES)[number];
