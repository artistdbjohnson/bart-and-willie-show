import { NextResponse } from "next/server";
import { readSubscribers } from "@/lib/subscribers";

export async function GET() {
  const store = await readSubscribers();
  return NextResponse.json(store, {
    headers: { "Cache-Control": "no-store" },
  });
}
