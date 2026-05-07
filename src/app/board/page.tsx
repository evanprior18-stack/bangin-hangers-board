type GameRow = {
  date: string;
  game: string;
  away_team: string;
  home_team: string;
  away_sp: string;
  home_sp: string;
  market_away: string;
  market_home: string;
  model_away: string;
  model_home: string;
  display_side: string;
  display_market: string;
  display_model: string;
  value: string;
  unit_size: string;
  status: string;
  note: string;
  last_updated: string;
};

const STATUS_SORT_ORDER: Record<string, number> = {
  Official: 1,
  Lean: 2,
  Pass: 3,
  "No Edge": 4,
  "Waiting Lineups": 5,
};

function getStatusSortRank(status: string) {
  return STATUS_SORT_ORDER[status] ?? 99;
}

function getUnitSizeNumber(unitSize: string) {
  const parsed = Number(unitSize);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortBoardRows(rows: GameRow[]) {
  return [...rows].sort((a, b) => {
    const statusDifference =
      getStatusSortRank(a.status) - getStatusSortRank(b.status);

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return getUnitSizeNumber(b.unit_size) - getUnitSizeNumber(a.unit_size);
  });
}

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtu-jA4QSoNpnXLP6_r98HoitjsCAdAnxzz6ZlkYHqCWC4IpWAIbU4YGT_AQ7b6WkN1_fJsvmacznM/pub?gid=392194397&single=true&output=csv";

function parseCSV(csv: string): GameRow[] {
  const lines = csv.trim().split("\n");
  const headers = parseCSVLine(lines[0]).map((header) => header.trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);

      const row = headers.reduce((acc, header, index) => {
        acc[header as keyof GameRow] = values[index]?.trim() ?? "";
        return acc;
      }, {} as GameRow);

      return row;
    })
    .filter((row) => row.game && row.game !== "#N/A" && row.status !== "#N/A");
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

async function getBoardData() {
  const response = await fetch(SHEET_CSV_URL, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch board data");
  }

  const csv = await response.text();
  const rows = parseCSV(csv);

  return sortBoardRows(rows);
}

function statusClass(status: string) {
  if (status === "Official") return "bg-emerald-400 text-neutral-950";
  if (status === "Lean") return "bg-blue-400 text-neutral-950";
  if (status === "Pass") return "bg-rose-400 text-neutral-950";
  if (status === "No Edge") return "bg-orange-300 text-neutral-950";
  if (status === "Waiting Lineups") return "bg-neutral-700 text-neutral-100";
  if (status === "Review") return "bg-amber-300 text-neutral-950";
  if (status === "Stale") return "bg-purple-400 text-neutral-950";
  return "bg-neutral-800 text-neutral-300";
}

function formatValue(value: string) {
  if (!value || value === "NONE" || value === "#N/A") return "—";

  const number = Number(value);

  if (Number.isNaN(number)) return value;

  if (number <= 0) return "—";

  return `+${number.toFixed(1)}`;
}

function formatUnits(units: string) {
  if (!units || units === "#N/A") return "0u";

  const number = Number(units);

  if (Number.isNaN(number)) return units;

  if (number === 3) return "REVIEW";

  return `${number}u`;
}

function getLastUpdated(games: GameRow[]) {
  const rowWithTimestamp = games.find((game) => game.last_updated);

  return rowWithTimestamp?.last_updated || "Manual timestamp coming soon";
}

export default async function BoardPage() {
  const games = await getBoardData();
  const lastUpdated = getLastUpdated(games);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-neutral-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
              Bangin Hangers
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Today&apos;s MLB Model Board
            </h1>

            <p className="mt-4 max-w-2xl text-neutral-300">
              Model lines vs market lines. Not every edge is an official play.
              Status shows how each game is being treated.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Last Updated
            </p>
            <p className="mt-1 whitespace-nowrap font-semibold">
              {lastUpdated}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            How to read this board
          </p>

          <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-300 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-neutral-100">Market</span> is
              the current available price.
            </p>

            <p>
              <span className="font-semibold text-neutral-100">Model</span>{" "} is
              the model&apos;s projected fair line.
            </p>

            <p>
              <span className="font-semibold text-neutral-100">Value</span>{" "}
              shows the difference between the market and model.
            </p>

            <p>
              <span className="font-semibold text-neutral-100">Status</span>{" "}
              explains whether the game is official, lean, pass, no edge, or
              waiting on lineup and news review.
            </p>
          </div>

          <p className="mt-4 text-sm text-neutral-400">
            Not every model edge becomes an official play. Status reflects the
            review process, not just raw model value.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Status Legend
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">
                Not every model edge is an official bet. Status shows how each
                game is being handled based on value, unit size, and lineup
                confidence.
              </p>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[720px] lg:grid-cols-5">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                  Official
                </span>
                <p className="mt-3 text-neutral-300">Tracked official play.</p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <span className="rounded-full bg-blue-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                  Lean
                </span>
                <p className="mt-3 text-neutral-300">
                  Model edge, not official.
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <span className="rounded-full bg-rose-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                  Pass
                </span>
                <p className="mt-3 text-neutral-300">Reviewed and passed.</p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <span className="rounded-full bg-orange-300 px-3 py-1 text-xs font-semibold text-neutral-950">
                  No Edge
                </span>
                <p className="mt-3 text-neutral-300">No positive model edge.</p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <span className="whitespace-nowrap rounded-full bg-neutral-700 px-3 py-1 text-xs font-semibold text-neutral-100">
                  Waiting Lineups
                </span>
                <p className="mt-3 text-neutral-300">Pending lineup review.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-[1500px] w-full border-collapse text-left text-sm">
              <thead className="bg-neutral-900 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4">Game</th>
                  <th className="whitespace-nowrap px-4 py-4">Pitchers</th>
                  <th className="whitespace-nowrap px-4 py-4">Market</th>
                  <th className="whitespace-nowrap px-4 py-4">Model</th>
                  <th className="whitespace-nowrap px-4 py-4">Value</th>
                  <th className="whitespace-nowrap px-4 py-4">Units</th>
                  <th className="whitespace-nowrap px-4 py-4">Status</th>
                  <th className="whitespace-nowrap px-4 py-4">Note</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {games.map((game) => (
                  <tr key={game.game} className="hover:bg-neutral-800/50">
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                      {game.game}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-neutral-300">
                      {game.away_sp} vs {game.home_sp}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {game.display_market}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {game.display_model}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-emerald-300">
                      {formatValue(game.value)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      {formatUnits(game.unit_size)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                          game.status
                        )}`}
                      >
                        {game.status}
                      </span>
                    </td>

                    <td className="min-w-[360px] max-w-lg px-4 py-4 text-neutral-300">
                      {game.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 p-4 lg:hidden">
            {games.map((game) => (
              <article
                key={game.game}
                className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{game.game}</h2>

                  <span
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                      game.status
                    )}`}
                  >
                    {game.status}
                  </span>
                </div>

                <p className="mt-2 overflow-x-auto whitespace-nowrap text-sm text-neutral-400">
                  {game.away_sp} vs {game.home_sp}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Market</p>
                    <p className="font-semibold">{game.display_market}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Model</p>
                    <p className="font-semibold">{game.display_model}</p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Value</p>
                    <p className="font-semibold text-emerald-300">
                      {formatValue(game.value)}
                    </p>
                  </div>

                  <div>
                    <p className="text-neutral-500">Units</p>
                    <p className="font-semibold">
                      {formatUnits(game.unit_size)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-300">
                  {game.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}