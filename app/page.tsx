import { Dashboard } from "@/components/Dashboard";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSection />
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Dashboard />
      </section>
      <footer className="mx-auto max-w-7xl px-6 pb-12 pt-6 text-xs text-white/40">
        <p>
          Sites are curated synthesis for inspiration — illustrative URLs.
          Built with Next.js, React Three Fiber, and restraint about when 3D
          actually earns its bandwidth.
        </p>
      </footer>
    </main>
  );
}
