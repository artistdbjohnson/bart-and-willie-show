import { NextResponse } from "next/server";
import { addShopOrder, cleanShopOrder } from "@/lib/shop-orders";

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
  const cleaned = cleanShopOrder(body as Parameters<typeof cleanShopOrder>[0]);
  if ("honeypot" in cleaned) {
    return NextResponse.json({ persisted: false });
  }
  if ("error" in cleaned) {
    return NextResponse.json({ error: cleaned.error }, { status: 400 });
  }
  const result = await addShopOrder(cleaned.entry);
  return NextResponse.json({
    persisted: result.persisted,
    entry: result.persisted ? undefined : cleaned.entry,
  });
}
