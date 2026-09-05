export interface PrepLine {
  category: "Food" | "Drink";
  prepTime: number;
  quantity: number;
}

/**
 * Kitchen and bar each work through their own lines in parallel, and the two
 * stations run at the same time as each other. A queue penalty accounts for
 * orders already ahead in the pipeline. Documented in docs/BUILD-NOTES.md.
 */
export function computeWaitTime(lines: PrepLine[], ordersAheadInQueue: number): number {
  const foodTimes = lines.filter((l) => l.category === "Food").map((l) => l.prepTime);
  const drinkTimes = lines.filter((l) => l.category === "Drink").map((l) => l.prepTime);

  const foodTime = foodTimes.length ? Math.max(...foodTimes) : 0;
  const drinkTime = drinkTimes.length ? Math.max(...drinkTimes) : 0;
  const base = Math.max(foodTime, drinkTime);
  const queue = 3 * ordersAheadInQueue;

  return base + queue;
}
