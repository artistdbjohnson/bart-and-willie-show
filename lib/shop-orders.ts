import { promises as fs } from "fs";
import path from "path";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const PIECES = ["tee", "hoodie"] as const;

export type ShopSize = (typeof SIZES)[number];
export type ShopPiece = (typeof PIECES)[number];

export type ShopOrder = {
  name: string;
  email: string;
  piece: ShopPiece;
  size: ShopSize;
  note: string;
  locale: "en" | "pt";
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "shop-orders.json");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function addShopOrder(
  entry: ShopOrder,
): Promise<{ persisted: boolean }> {
  let orders: ShopOrder[] = [];
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    orders = Array.isArray(parsed) ? (parsed as ShopOrder[]) : [];
  } catch {
    orders = [];
  }
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify([...orders, entry], null, 2)}\n`);
    return { persisted: true };
  } catch {
    return { persisted: false };
  }
}

export function cleanShopOrder(input: {
  name?: unknown;
  email?: unknown;
  piece?: unknown;
  size?: unknown;
  note?: unknown;
  locale?: unknown;
  company?: unknown;
}) {
  if (typeof input.company === "string" && input.company.trim()) {
    return { honeypot: true as const };
  }
  const name = String(input.name ?? "")
    .replace(/[\u0000-\u001F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const note = String(input.note ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
  if (name.length < 1 || name.length > 80) return { error: "name" as const };
  if (!EMAIL.test(email) || email.length > 160) return { error: "email" as const };
  if (!PIECES.includes(input.piece as ShopPiece)) return { error: "piece" as const };
  if (!SIZES.includes(input.size as ShopSize)) return { error: "size" as const };
  const locale = input.locale === "pt" ? "pt" : "en";
  return {
    entry: {
      name,
      email,
      piece: input.piece as ShopPiece,
      size: input.size as ShopSize,
      note,
      locale,
      createdAt: new Date().toISOString(),
    } satisfies ShopOrder,
  };
}
