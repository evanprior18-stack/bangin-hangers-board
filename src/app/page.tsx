export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Bangin Hangers
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          MLB Model Board
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          Model lines vs market lines, with notes on where the model sees value,
          where I&apos;m passing, and what I&apos;m reviewing.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/board"
            className="rounded-full bg-emerald-400 px-6 py-3 text-center font-semibold text-neutral-950 transition hover:bg-emerald-300"
          >
            View Today&apos;s Board
          </a>

          <a
            href="/about"
            className="rounded-full border border-neutral-700 px-6 py-3 text-center font-semibold text-neutral-100 transition hover:border-neutral-500"
          >
            About the Model
          </a>
        </div>
      </section>
    </main>
  );
}