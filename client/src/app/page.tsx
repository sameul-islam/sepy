import CategoryDiscovery from "@/components/home/category-discovery/CategoryDiscovery";
import CollectionEditorial from "@/components/home/collection/CollectionEditorial";
import FeaturedProducts from "@/components/home/featured/FeaturedProducts";
import Hero from "@/components/home/hero/Hero";
import TheLook from "@/components/home/look/TheLook";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryDiscovery/>
      <CollectionEditorial/>
      <FeaturedProducts/>
      <TheLook/>
    </main>
  );
}
