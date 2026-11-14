import CategoryDiscovery from "@/components/home/category-discovery/CategoryDiscovery";
import CollectionEditorial from "@/components/home/collection/CollectionEditorial";
import FeaturedProducts from "@/components/home/featured/FeaturedProducts";
import Hero from "@/components/home/hero/Hero";
import NewArrivals from "@/components/home/new-arrivals/NewArrivals";
import NewArrivalsSkeleton from "@/components/home/new-arrivals/NewArrivalsSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryDiscovery />
      <Suspense fallback={<NewArrivalsSkeleton />}>
        <NewArrivals />
      </Suspense>
      <CollectionEditorial />
      <FeaturedProducts />
    </main>
  );
}
