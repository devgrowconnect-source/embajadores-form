import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const filename = `respuesta-${Date.now()}.json`;
    await put(filename, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
