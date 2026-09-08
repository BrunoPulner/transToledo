import { HomeHero } from "@/components/home/HomeHero";
import { Header } from "@/components/layout/Header";
import { HomeLoading } from "@/components/ui/HomeLoading";
import { AboutSection } from "@/components/home/AboutSection";
import { FleetPreview } from "@/components/home/FleetPreview";

export default function Home() {
  return (
    <>
      <HomeLoading />
      <Header />

      <main>
        <HomeHero />

        <AboutSection />
        <FleetPreview />
      </main>
    </>
  );
}
