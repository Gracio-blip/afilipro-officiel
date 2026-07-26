const BOT = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegram(text: string): Promise<void> {
  if (!BOT || !CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {}
}

export function fmtMoney(n: number) {
  return `${n.toLocaleString("fr-FR")} FCFA`;
}

export function lomeTime(d?: Date) {
  return (d ?? new Date()).toLocaleString("fr-FR", {
    timeZone: "Africa/Lome",
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }) + " GMT+0";
}
