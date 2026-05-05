export default function AboutPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-4xl px-6 py-10">
        <a href="/" className="text-sm text-neutral-400 hover:text-emerald-400">
          ← Home
        </a>

        <p className="mt-10 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Bangin Hangers
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
          About the Model Board
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-300">
          This board tracks my MLB model lines against current market lines. The
          goal is not to be a traditional picks page. It is to document the
          process of running, reviewing, and improving a baseball betting model
          over a full season.
        </p>

        <div className="mt-10 grid gap-5">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">What the board shows</h2>
            <p className="mt-3 leading-7 text-neutral-300">
              Each game shows the market line, my model line, the value gap,
              unit size, status, and a short note. The displayed side is usually
              the side where the model sees positive value. If there is no edge,
              the board may show both sides of the market and model line.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Status definitions</h2>

            <div className="mt-5 grid gap-4 text-neutral-300">
              <p>
                <span className="font-semibold text-emerald-300">Official:</span>{" "}
                A model play based on current inputs.
              </p>

              <p>
                <span className="font-semibold text-blue-300">Lean:</span>{" "}
                Positive model value, but below the official play threshold.
              </p>

              <p>
                <span className="font-semibold text-amber-300">Review:</span>{" "}
                The model shows value, but the spot needs more investigation
                before I would treat it as official.
              </p>

              <p>
                <span className="font-semibold text-rose-300">Pass:</span>{" "}
                The model may show value, but I am intentionally passing.
              </p>

              <p>
                <span className="font-semibold text-neutral-200">
                  Waiting Lineups:
                </span>{" "}
                Final lineups/news are not fully verified yet.
              </p>

              <p>
                <span className="font-semibold text-purple-300">Stale:</span>{" "}
                The number is no longer current because of news, pitching
                changes, lineup changes, or market movement.
              </p>

              <p>
                <span className="font-semibold text-neutral-400">No Edge:</span>{" "}
                The model line sits inside the market spread or does not show
                enough positive value.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">How to read the board</h2>
            <p className="mt-3 leading-7 text-neutral-300">
              A model edge is not automatically a bet. Large model/market gaps
              can be real signal, but they can also point to stale inputs, lineup
              uncertainty, market information I am missing, or model
              overconfidence. The status and note columns are meant to show how
              I am treating each game, not just what the raw model says.
            </p>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-bold">Disclaimer</h2>
            <p className="mt-3 leading-7 text-neutral-300">
              This site is for tracking and documenting model output. It is not
              financial advice, betting advice, or a guarantee of results.
              Baseball betting involves variance and risk.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}