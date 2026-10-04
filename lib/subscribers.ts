import { promises as fs } from "fs";
import path from "path";

export type Subscriber = {
  name: string;
  email: string;
  locale: "en" | "pt";
  createdAt: string;
};

const filePath = path.join(process.cwd(), "data", "subscribers.json");

export async function readSubscribers(): Promise<{
  subscribers: Subscriber[];
  filePresent: boolean;
}> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return {
      subscribers: Array.isArray(parsed) ? (parsed as Subscriber[]) : [],
      filePresent: true,
    };
  } catch {
    return { subscribers: [], filePresent: false };
  }
}

export async function addSubscriber(
  entry: Subscriber,
): Promise<{ persisted: boolean; duplicate: boolean }> {
  const { subscribers } = await readSubscribers();
  const duplicate = subscribers.some((row) => row.email === entry.email);
  const next = duplicate
    ? subscribers.map((row) =>
        row.email === entry.email
          ? { ...row, name: entry.name, locale: entry.locale }
          : row,
      )
    : [...subscribers, entry];

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`);
    return { persisted: true, duplicate };
  } catch {
    return { persisted: false, duplicate };
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanSignup(input: {
  name?: unknown;
  email?: unknown;
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
  if (name.length < 1 || name.length > 80) return { error: "name" as const };
  if (!EMAIL.test(email) || email.length > 160) return { error: "email" as const };
  const locale = input.locale === "pt" ? "pt" : "en";
  return {
    entry: {
      name,
      email,
      locale,
      createdAt: new Date().toISOString(),
    } satisfies Subscriber,
  };
}
