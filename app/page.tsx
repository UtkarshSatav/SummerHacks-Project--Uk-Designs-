import { SmoothScroll } from "./landing/SmoothScroll";
import { PageTransition } from "./landing/PageTransition";
import { Header } from "./landing/Header";
import { Hero } from "./landing/Hero";
import { About } from "./landing/About";
import { Features } from "./landing/Features";
import { Stats, Pricing } from "./landing/Stats";
import { FinalCTA, Footer } from "./landing/FinalCTA";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <PageTransition />
      
      <Header />
      <main className="relative">
        <Hero />
        <About />
        <Features />
        <Stats />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
