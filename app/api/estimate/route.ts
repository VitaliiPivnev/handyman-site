import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") || "";
    const phone = formData.get("phone") || "";
    const email = formData.get("email") || "";
    const location = formData.get("location") || "";
    const message = formData.get("message") || "";

    const text = `
🔥 New Handyman Lead

👤 Name: ${name}
📞 Phone: ${phone}
📧 Email: ${email}
📍 Location: ${location}

🛠 Project:
${message}
`;

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
        }),
      }
    );

    const files = formData.getAll("attachment") as File[];

    for (const file of files) {
      if (file && file.size > 0) {
        const photoData = new FormData();
        photoData.append("chat_id", process.env.TELEGRAM_CHAT_ID || "");
        photoData.append("photo", file);

        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
          {
            method: "POST",
            body: photoData,
          }
        );
      }
    }

    return NextResponse.redirect(new URL("/thanks", request.url), 303);
  } catch {
    return NextResponse.json(
      { error: "Failed to send request" },
      { status: 500 }
    );
  }
}