export function getNetWorthColor(netWorth) {
  if (netWorth < 100000) {
    return '#ef4444'; // Red (< $100k)
  }
  if (netWorth <= 200000) {
    return '#f97316'; // Orange ($100k - $200k)
  }
  return '#22c55e'; // Green (> $200k)
}