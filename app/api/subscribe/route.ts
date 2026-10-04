import { NextResponse } from "next/server";
import { addSubscriber, cleanSignup } from "@/lib/subscribers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const cleaned = cleanSignup(body as Parameters<typeof cleanSignup>[0]);
  if ("honeypot" in cleaned) {
    return NextResponse.json({ persisted: false, duplicate: false });
  }
  if ("error" in cleaned) {
    return NextResponse.json({ error: cleaned.error }, { status: 400 });
  }
  const result = await addSubscriber(cleaned.entry);
  return NextResponse.json({
    persisted: result.persisted,
    duplicate: result.duplicate,
    entry: result.persisted ? undefined : cleaned.entry,
  });
}
