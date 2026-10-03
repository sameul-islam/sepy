import CategoryDiscovery from "@/components/site/CategoryDiscovery/CategoryDiscovery";
import CollectionEditorial from "@/components/site/CategoryDiscovery/CollectionEditorial";
import Hero from "@/components/site/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryDiscovery/>
      <CollectionEditorial/>
    </main>
  );
}
