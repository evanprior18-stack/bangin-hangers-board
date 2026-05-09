type HistoryRow = {
  section: string;
  label: string;
  wins: string;
  losses: string;
  units: string;
  notes: string;
};

const HISTORY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtu-jA4QSoNpnXLP6_r98HoitjsCAdAnxzz6ZlkYHqCWC4IpWAIbU4YGT_AQ7b6WkN1_fJsvmacznM/pub?gid=715231661&single=true&output=csv";

function parseCSV(csv: string): HistoryRow[] {
  const lines = csv.trim().split("\n");
  const headers = parseCSVLine(lines[0]).map((header) => header.trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);

      const row = headers.reduce((acc, header, index) => {
        acc[header as keyof HistoryRow] = values[index]?.trim() ?? "";
        return acc;
      }, {} as HistoryRow);

      return row;
    })
    .filter((row) => row.section && row.label);
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

async function getHistoryData() {
  const response = await fetch(HISTORY_CSV_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch history data");
  }

  const csv = await response.text();

  return parseCSV(csv);
}

function getSectionRows(rows: HistoryRow[], section: string) {
  return rows.filter((row) => row.section === section);
}

function getMetaValue(rows: HistoryRow[], label: string) {
  return (
    rows.find((row) => row.section === "meta" && row.label === label)?.notes ||
    ""
  );
}

function formatUnits(units: string) {
  if (!units) return "—";

  const number = Number(units);

  if (Number.isNaN(number)) return units;

  if (number > 0) return `+${number.toFixed(2)}`;

  return number.toFixed(2);
}

function unitColorClass(units: string) {
  if (!units) return "text-neutral-400";

  const number = Number(units);

  if (Number.isNaN(number)) return "text-neutral-100";
  if (number > 0) return "text-emerald-300";
  if (number < 0) return "text-rose-300";

  return "text-neutral-100";
}

function formatRecord(wins: string, losses: string) {
  if (!wins && !losses) return "—";

  return `${wins || 0}-${losses || 0}`;
}

function formatWinPct(wins: string, losses: string) {
  const winNumber = Number(wins);
  const lossNumber = Number(losses);

  if (!Number.isFinite(winNumber) || !Number.isFinite(lossNumber)) return "—";

  const total = winNumber + lossNumber;

  if (total === 0) return "—";

  return `${((winNumber / total) * 100).toFixed(1)}%`;
}

function formatUnitBucket(label: string) {
  if (label.endsWith("u")) return label;

  return `${label}u`;
}

export default async function HistoryPage() {
  const rows = await getHistoryData();

  const primaryRow = getSectionRows(rows, "primary")[0];
  const comparisonRows = getSectionRows(rows, "comparison");
  const unitBreakdownRows = getSectionRows(rows, "unit_breakdown");
  const weeklyRows = getSectionRows(rows, "weekly");
  const monthlyRows = getSectionRows(rows, "monthly");
  const historyLastUpdated = getMetaValue(rows, "last_updated");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-b border-neutral-800 pb-8">
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            Bangin Hangers
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Model History
          </h1>

          <p className="mt-4 max-w-3xl text-neutral-300">
            High-level public history for the MLB model board. The primary
            public record is Current Model - Official Plays. Flat Unit results
            are included as a simple comparison view. Prior Model results are
            shown for historical context.
          </p>
          {historyLastUpdated && (
            <p className="mt-4 text-sm text-neutral-500">
            History last updated:{" "}
            <span className="font-medium text-neutral-300">
            {historyLastUpdated}
            </span>
            </p>
)}
        </div>

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Primary Performance
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Record</p>
              <p className="mt-2 text-3xl font-bold">
                {primaryRow
                  ? formatRecord(primaryRow.wins, primaryRow.losses)
                  : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Units</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  primaryRow
                    ? unitColorClass(primaryRow.units)
                    : "text-neutral-400"
                }`}
              >
                {primaryRow ? formatUnits(primaryRow.units) : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-sm text-neutral-500">Win Rate</p>
              <p className="mt-2 text-3xl font-bold">
                {primaryRow
                  ? formatWinPct(primaryRow.wins, primaryRow.losses)
                  : "—"}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-neutral-400">
            {primaryRow?.notes ||
              "Primary public record. Excludes pass-only rows."}
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Model Comparison
          </p>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-neutral-400">
            The primary public record is Current Model - Official Plays. Flat Unit
            results show how the same model performed using a simple 1-unit approach.
            Prior Model results are included only for historical context.
        </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-neutral-800">
                  <th className="whitespace-nowrap px-4 py-3">System</th>
                  <th className="whitespace-nowrap px-4 py-3">Record</th>
                  <th className="whitespace-nowrap px-4 py-3">Win Rate</th>
                  <th className="whitespace-nowrap px-4 py-3">Units</th>
                  <th className="whitespace-nowrap px-4 py-3">Notes</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-800">
                {comparisonRows.map((row) => (
                  <tr key={`${row.section}-${row.label}`}>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                      {row.label}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatRecord(row.wins, row.losses)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatWinPct(row.wins, row.losses)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-4 font-semibold ${unitColorClass(
                        row.units
                      )}`}
                    >
                      {formatUnits(row.units)}
                    </td>
                    <td className="min-w-[260px] px-4 py-4 text-neutral-300">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Current Model - Official Plays by Unit Size
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {unitBreakdownRows.map((row) => (
              <div
                key={`${row.section}-${row.label}`}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
              >
                <p className="text-sm text-neutral-500">
                  {formatUnitBucket(row.label)}
                </p>
                <p className="mt-2 text-xl font-bold">
                  {formatRecord(row.wins, row.losses)}
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  {formatWinPct(row.wins, row.losses)}
                </p>
                <p
                  className={`mt-3 text-lg font-semibold ${unitColorClass(
                    row.units
                  )}`}
                >
                  {formatUnits(row.units)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Weekly Performance
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-neutral-500">
                  <tr className="border-b border-neutral-800">
                    <th className="whitespace-nowrap px-4 py-3">Week</th>
                    <th className="whitespace-nowrap px-4 py-3">Units</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {weeklyRows.map((row) => (
                    <tr key={`${row.section}-${row.label}`}>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold">
                        {row.label}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-4 font-semibold ${unitColorClass(
                          row.units
                        )}`}
                      >
                        {formatUnits(row.units)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Monthly Performance
            </p>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-neutral-500">
                  <tr className="border-b border-neutral-800">
                    <th className="whitespace-nowrap px-4 py-3">Month</th>
                    <th className="whitespace-nowrap px-4 py-3">Units</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800">
                  {monthlyRows.map((row) => (
                    <tr key={`${row.section}-${row.label}`}>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold">
                        {row.label}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-4 font-semibold ${unitColorClass(
                          row.units
                        )}`}
                      >
                        {formatUnits(row.units)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Methodology Note
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-neutral-300">
            This page is a public model-history summary, not a picks page or a
            guarantee of future results. It shows results, records, and units at
            a high level. It does not disclose proprietary model logic, raw
            formulas, private adjustment columns, lineup adjustment rules, exact
            weights, or edge-generation methodology.
          </p>
        </section>
      </section>
    </main>
  );
}