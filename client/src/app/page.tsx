import CategoryDiscovery from "@/components/home/category-discovery/CategoryDiscovery";
import CollectionEditorial from "@/components/home/collection/CollectionEditorial";
import FeaturedProducts from "@/components/home/featured/FeaturedProducts";
import Hero from "@/components/home/hero/Hero";
import NewArrivals from "@/components/home/new-arrivals/NewArrivals";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryDiscovery/>
      <NewArrivals/>
      <CollectionEditorial/>
      <FeaturedProducts/>
    </main>
  );
}
