import CategoryDiscovery from "@/components/site/CategoryDiscovery/CategoryDiscovery";
import CollectionEditorial from "@/components/site/CategoryDiscovery/CollectionEditorial";
import FeaturedProducts from "@/components/site/Featured/FeaturedProducts";
import Hero from "@/components/site/Hero/Hero";
import TheLook from "@/components/site/Look/TheLook";

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
