import { ScrollStory } from "@/components/ScrollStory";
import { Experience } from "@/components/Experience";
import { ProductSpecs } from "@/components/ProductSpecs";
import { Design } from "@/components/Design";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ScrollStory />
        <Experience />
        <ProductSpecs />
        <Design />
      </main>
      <Footer />
    </>
  );
}
