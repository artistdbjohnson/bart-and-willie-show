"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ChalkPlay } from "@/components/chalk-play";
import { Lockup } from "@/components/lockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";

type Row = { name: string; email: string; locale: Locale; createdAt: string };

const LOCAL_KEY = "baw-subscribers";

function titleLines(title: string) {
  const breakAt = title.indexOf(". ");
  if (breakAt === -1) return [title];
  return [title.slice(0, breakAt + 1), title.slice(breakAt + 2)];
}

function readLocal(): Row[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as Row[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: Row[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export function SubscribeForm({ locale }: { locale: Locale }) {
  const t = copy[locale].list;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState<"name" | "email" | null>(null);
  const [operator, setOperator] = useState(false);

  useEffect(() => {
    setOperator(new URLSearchParams(window.location.search).get("operator") === "1");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const company = String(new FormData(form).get("company") ?? "");
    setFieldError(null);
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, locale, company }),
      });
      const payload = (await response.json()) as {
        persisted?: boolean;
        duplicate?: boolean;
        error?: string;
        entry?: Row;
      };
      if (!response.ok || payload.error) {
        setStatus("error");
        setFieldError(payload.error === "name" || payload.error === "email" ? payload.error : null);
        setMessage(t.failed);
        return;
      }
      if (payload.entry && payload.persisted === false) {
        const local = readLocal().filter((row) => row.email !== payload.entry?.email);
        writeLocal([...local, payload.entry]);
      }
      setStatus("done");
      setMessage(t.saved);
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t.failed);
    }
  }

  async function exportCsv() {
    const local = readLocal();
    let server: Row[] = [];
    try {
      const response = await fetch("/api/subscribers", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as { subscribers?: Row[] };
        server = payload.subscribers ?? [];
      }
    } catch {
      server = [];
    }
    const merged = new Map<string, Row>();
    for (const row of [...server, ...local]) merged.set(row.email, row);
    const rows = [...merged.values()];
    if (rows.length === 0) return;
    const lines = [
      "name,email,locale,createdAt",
      ...rows.map((row) =>
        [row.name, row.email, row.locale, row.createdAt].map(csvEscape).join(","),
      ),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\n")}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bart-willie-subscribers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section-snap scroll-mt-[var(--nav-clear)] border-t border-chalk/15">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-16">
        <div className="newsletter-art @container relative flex w-full max-w-[26rem] min-w-0 aspect-[4/5] items-end overflow-hidden sm:aspect-[5/4]">
          <ChalkPlay className="pointer-events-none absolute top-6 right-2 h-40 w-auto text-chalk sm:h-52" />
          <div className="relative z-[1] w-full max-w-full overflow-hidden p-6 pb-8 sm:p-8">
            <Lockup size="footer" />
          </div>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-signal" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="@container max-w-3xl">
            <p className="font-ui text-[0.72rem] uppercase tracking-[0.22em] text-quiet">{t.kicker}</p>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,8.8cqi,3.75rem)] leading-[0.84] tracking-tight">
              {titleLines(t.title).map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-chalk/85 md:text-xl">{t.lede}</p>
          </div>
        <form
          onSubmit={onSubmit}
          className="mt-8 border-t-4 border-signal pt-8"
          noValidate
        >
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="signup-name">{t.name}</Label>
              <Input
                id="signup-name"
                name="name"
                autoComplete="name"
                value={name}
                aria-invalid={fieldError === "name"}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-email">{t.email}</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                aria-invalid={fieldError === "email"}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
                {t.submit}
              </Button>
              {operator ? (
                <Button type="button" variant="outline" onClick={exportCsv}>
                  {t.export}
                </Button>
              ) : null}
            </div>
            <p
              role={status === "error" ? "alert" : "status"}
              className="min-h-6 font-serif text-base text-chalk/85"
            >
              {message}
            </p>
          </div>
        </form>
        <p className="mt-6 max-w-md font-serif text-base leading-relaxed text-chalk/85">{t.note}</p>
        </div>
      </div>
    </section>
  );
}
