import { processTelegramUpdate, type TelegramUpdate } from "./bot.ts";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_CMS_WEBHOOK_SECRET;
  const supplied = request.headers.get("x-telegram-bot-api-secret-token");
  const validSecret = Boolean(expected && supplied) && Buffer.byteLength(expected!) === Buffer.byteLength(supplied!) && timingSafeEqual(Buffer.from(expected!), Buffer.from(supplied!));
  if (!validSecret) return new Response("Forbidden", { status: 403 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 1_000_000) return new Response("Payload too large", { status: 413 });
  try {
    const update = await request.json() as TelegramUpdate;
    if (!Number.isInteger(update.update_id)) return new Response("Bad request", { status: 400 });
    await processTelegramUpdate(update);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Portfolio CMS update failed", { category: error instanceof Error ? error.name : "unknown" });
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ service: "portfolio-cms", configured: Boolean(process.env.TELEGRAM_CMS_BOT_TOKEN && process.env.TELEGRAM_CMS_OWNER_ID) });
}
