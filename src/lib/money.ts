export function formatNaira(amountNaira: number): string {
  return `₦${amountNaira.toLocaleString("en-NG")}`;
}
