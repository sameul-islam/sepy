import CategoryDiscovery from "@/components/home/category-discovery/CategoryDiscovery";
import CollectionEditorial from "@/components/home/collection/CollectionEditorial";
import FeaturedProducts from "@/components/home/featured/FeaturedProducts";
import Hero from "@/components/home/hero/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryDiscovery/>
      <CollectionEditorial/>
      <FeaturedProducts/>
    </main>
  );
}
