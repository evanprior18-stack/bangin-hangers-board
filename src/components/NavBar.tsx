export default function NavBar() {
  return (
    <nav className="border-b border-neutral-800 bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-400"
        >
          Bangin Hangers
        </a>

        <div className="flex items-center gap-5 text-sm font-medium text-neutral-300">
          <a href="/" className="hover:text-emerald-400">
            Home
          </a>

          <a href="/board" className="hover:text-emerald-400">
            Board
          </a>

          <a href="/about" className="hover:text-emerald-400">
            About
          </a>
        </div>
      </div>
    </nav>
  );
}