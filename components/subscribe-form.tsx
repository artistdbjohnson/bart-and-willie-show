"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";

type Row = { name: string; email: string; locale: Locale; createdAt: string };

const LOCAL_KEY = "baw-subscribers";

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

export function SubscribeForm({ locale, image }: { locale: Locale; image?: string | null }) {
  const t = copy[locale].list;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState<"name" | "email" | null>(null);

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
        setMessage(
          payload.error === "name"
            ? t.nameError
            : payload.error === "email"
              ? t.emailError
              : t.genericError,
        );
        return;
      }
      if (payload.entry && payload.persisted === false) {
        const local = readLocal().filter((row) => row.email !== payload.entry?.email);
        writeLocal([...local, payload.entry]);
      }
      setStatus("done");
      const saved = payload.persisted ? t.persisted : t.browser;
      setMessage(payload.duplicate ? `${t.duplicate} ${saved}` : saved);
      setName("");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(t.genericError);
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
    if (rows.length === 0) {
      setStatus("error");
      setMessage(t.empty);
      return;
    }
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
    <section className="border-t border-chalk/15">
      <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-12 lg:gap-12">
        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-signal sm:aspect-[5/4]">
            {image ? (
              <Image src={image} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            ) : (
              <Image
                src="/brand/mark.jpg"
                alt="The Bart & Willie Show"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-field via-field/20 to-transparent" />
            {image ? (
              <Image
                src="/brand/mark.jpg"
                alt=""
                width={512}
                height={512}
                className="absolute top-4 left-4 size-14 object-cover sm:top-6 sm:left-6 sm:size-16"
              />
            ) : null}
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <SectionHeading kicker={t.kicker} title={t.title} lede={t.lede} />
          <p className="mt-6 max-w-md font-serif text-base leading-relaxed text-chalk/85">{t.note}</p>
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
                {status === "sending" ? t.sending : t.submit}
              </Button>
              <Button type="button" variant="outline" onClick={exportCsv}>
                {t.export}
              </Button>
            </div>
            <p
              role={status === "error" ? "alert" : "status"}
              className="min-h-6 font-serif text-base text-chalk/85"
            >
              {message}
            </p>
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}
