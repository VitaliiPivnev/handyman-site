type Button = { text: string; callback_data?: string; url?: string };

const token = () => process.env.TELEGRAM_CMS_BOT_TOKEN;

export async function telegram(method: string, body: Record<string, unknown>): Promise<unknown> {
  const botToken = token();
  if (!botToken) throw new Error("Telegram CMS bot is not configured");
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const result = await response.json() as { ok?: boolean; result?: unknown };
  if (!response.ok || !result.ok) throw new Error(`Telegram ${method} failed`);
  return result.result;
}

export async function sendMessage(chatId: number | string, text: string, rows?: Button[][]) {
  return telegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(rows ? { reply_markup: { inline_keyboard: rows } } : {}),
  });
}

export async function answerCallback(id: string, text?: string) {
  return telegram("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

export async function downloadTelegramTextFile(fileId: string): Promise<string> {
  const botToken = token();
  if (!botToken) throw new Error("Telegram CMS bot is not configured");
  const result = await telegram("getFile", { file_id: fileId }) as { file_path?: string };
  if (!result.file_path) throw new Error("Telegram file is unavailable");
  const response = await fetch(`https://api.telegram.org/file/bot${botToken}/${result.file_path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to download JSON file");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 100_000) throw new Error("JSON file is too large");
  return new TextDecoder().decode(bytes);
}

export const mainMenu = [
  [{ text: "➕ New Project", callback_data: "new" }],
  [{ text: "📁 Published Projects", callback_data: "published" }, { text: "📝 Drafts", callback_data: "drafts" }],
  [{ text: "✏️ Edit Project", callback_data: "published" }, { text: "🗑 Delete Project", callback_data: "published" }],
  [{ text: "❓ Help", callback_data: "help" }],
];
