import Hero from "@/components/home/HeroBanner/HeroBanner";
import ColaboradoresSection from "@/components/home/Collaborators/Collaborators";
import NovedadesSection from "@/components/home/News/News";

export default function Home() {
  return (
    
    <div className="min-h-screen bg-black text-white">
      <Hero />

      <ColaboradoresSection />

      <NovedadesSection />



    </div>
  );
}