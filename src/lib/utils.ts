export function formatMoney(amount: number): string {
  return `${Number(amount).toLocaleString("fr-FR")} FCFA`;
}

export function getMinWithdrawal(wallet: { totalWithdrawals?: string | number | null }): number {
  const count = Number(wallet.totalWithdrawals ?? 0);
  const mins = [1500, 3000, 6000, 12000, 24000, 48000, 96000];
  return mins[Math.min(count, mins.length - 1)];
}

export function formatGMT(date?: Date): string {
  const d = date ?? new Date();
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `GMT ${h}:${m}:${s}`;
}
