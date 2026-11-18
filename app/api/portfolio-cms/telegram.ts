import { CmsRuntimeError, dependencyError } from "./errors.ts";

type Button = { text: string; callback_data?: string; url?: string };

const token = () => process.env.TELEGRAM_CMS_BOT_TOKEN;

export async function telegram(method: string, body: Record<string, unknown>): Promise<unknown> {
  const botToken = token();
  if (!botToken) throw new CmsRuntimeError("telegram_not_configured", "telegram", method, false);
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    throw dependencyError(error, ["telegram_network_error", "telegram", method, true]);
  }
  let result: { ok?: boolean; result?: unknown; error_code?: number };
  try {
    result = await response.json() as { ok?: boolean; result?: unknown; error_code?: number };
  } catch (error) {
    throw dependencyError(error, ["telegram_invalid_response", "telegram", method, true, response.status]);
  }
  if (!response.ok || !result.ok) {
    const status = result.error_code || response.status;
    throw new CmsRuntimeError("telegram_api_error", "telegram", method, status === 429 || status >= 500, status);
  }
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
  if (!botToken) throw new CmsRuntimeError("telegram_not_configured", "telegram", "download_file", false);
  const result = await telegram("getFile", { file_id: fileId }) as { file_path?: string };
  if (!result.file_path) throw new CmsRuntimeError("telegram_file_unavailable", "telegram", "getFile", true);
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/file/bot${botToken}/${result.file_path}`, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  } catch (error) {
    throw dependencyError(error, ["telegram_file_network_error", "telegram", "download_file", true]);
  }
  if (!response.ok) throw new CmsRuntimeError("telegram_file_http_error", "telegram", "download_file", response.status >= 500 || response.status === 429, response.status);
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
