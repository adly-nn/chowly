function pad(prefix: string, n: number, width = 3): string {
  return `${prefix}${String(n).padStart(width, "0")}`;
}

function parseNumber(id: string, prefix: string): number {
  const n = parseInt(id.slice(prefix.length), 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Reads every existing ID with this prefix and returns the next one.
 * `floor` lets an entity continue the approved model's numbering (e.g.
 * Orders start at O004 because O001-O003 exist in the approved sample data
 * but are not re-seeded here).
 */
export async function nextId<T extends Record<string, string>>(
  delegate: { findMany: (args: { where: object; select: object }) => Promise<T[]> },
  idField: string,
  prefix: string,
  floor = 0,
): Promise<string> {
  const rows = await delegate.findMany({
    where: { [idField]: { startsWith: prefix } },
    select: { [idField]: true },
  });

  let max = floor;
  for (const row of rows) {
    const n = parseNumber(row[idField], prefix);
    if (n > max) max = n;
  }

  return pad(prefix, max + 1);
}
