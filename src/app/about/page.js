import BackgroundCarousel from "@/components/BackgroundCarousel";

export default function About() {
  return (
    <>
      <BackgroundCarousel />
      <div className="container mx-auto px-4 py-8 mt-24">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white tracking-tight drop-shadow-sm">About Pokédex</h1>
        <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/40 dark:bg-gray-950/40 p-8 rounded-3xl border border-white/50 dark:border-white/5 shadow-2xl overflow-hidden animate-fade-in text-gray-800 dark:text-gray-200">
          <p className="font-semibold text-lg leading-relaxed mb-6">
            Welcome to the ultimate Pokémon database! This Pokédex application compiles a complete offline encyclopedia of all 1,025 Pokémon species, offering instant searching, sorting, and advanced category filtering with sub-millisecond speeds.
          </p>
          <p className="font-medium leading-relaxed mb-6">
            This project showcases modern full-stack web architectures using Next.js 15, React 19, and TailwindCSS. By leveraging localized builds and in-memory caches, we provide an entirely serverless, zero-api-delay browsing experience that functions smoothly even offline.
          </p>
          <div className="border-t border-black/5 dark:border-white/5 pt-6 mt-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">🚀 Tech Stack Highlights</h2>
            <ul className="grid grid-cols-2 gap-3 text-sm font-semibold">
              <li className="flex items-center gap-2">⚡ Next.js 15 App Router</li>
              <li className="flex items-center gap-2">🎨 TailwindCSS v4</li>
              <li className="flex items-center gap-2">⚛️ React 19 Client hooks</li>
              <li className="flex items-center gap-2">📊 Localized PokeAPI Caches</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
