export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">About Pokedesk</h1>
      <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/30 p-6 rounded-xl shadow-lg">
        <p className="text-gray-800 font-medium text-lg leading-relaxed">This is a simple Pokédex app built with Next.js and TailwindCSS. Explore Pokémon, add your favorites, and learn more about each one!</p>
        <p className="text-gray-800 font-medium mt-4 text-lg leading-relaxed">Use the search feature to find specific Pokémon by name or ID, or browse the complete collection. You can save your favorite Pokémon for quick access later.</p>
      </div>
    </div>
  );
}
