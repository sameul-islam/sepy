
import { getProducts } from "@/lib/api";
import type { Product } from "@/lib/api-types";

import NewArrivalsRail from "./NewArrivalsRail";

export default async function NewArrivals() {
  let products: Product[];

  try {
    const result = await getProducts({
      page: 1,
      limit: 8,
      sort: "newest",
    });

    products = result.products.filter(
      (product) => product.images.length > 0,
    );
  } catch (error) {
    console.error("Failed to load new arrivals:", error);
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="group/new-arrivals bg-background px-3 py-5 sm:px-5 lg:px-6 xl:px-10"
    >
      <div className="mx-auto max-w-full">
        <header className=" mb-3 sm:mb-5">
          <h2
            id="new-arrivals-title"
            className="font-extrabold text-black sm:text-xl uppercase"
          >
            New Releases
          </h2>
        </header>

        <NewArrivalsRail products={products} />
      </div>
    </section>
  );
}
