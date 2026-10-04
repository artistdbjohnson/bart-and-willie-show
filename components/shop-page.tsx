"use client";

import { useState, type FormEvent } from "react";
import { Lockup } from "@/components/lockup";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/lib/copy";
import type { Locale } from "@/lib/paths";
import { cn } from "@/lib/utils";

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
type Piece = "tee" | "hoodie";
type Size = (typeof SIZES)[number];

export function ShopPage({ locale }: { locale: Locale }) {
  const t = copy[locale].shop;
  const [piece, setPiece] = useState<Piece>("tee");
  const [size, setSize] = useState<Size>("L");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const company = String(new FormData(event.currentTarget).get("company") ?? "");
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/shop-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, piece, size, note, locale, company }),
      });
      const payload = (await response.json()) as { persisted?: boolean; error?: string };
      if (!response.ok || payload.error) {
        setStatus("error");
        setMessage(t.failed);
        return;
      }
      setStatus("done");
      setMessage(t.sent);
      setName("");
      setEmail("");
      setNote("");
    } catch {
      setStatus("error");
      setMessage(t.failed);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading kicker={t.kicker} title={t.title} lede={t.lede} />
      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        <PieceCard label={t.tee} piece="tee" />
        <PieceCard label={t.hoodie} piece="hoodie" />
      </div>
      <p className="mt-8 max-w-2xl font-serif text-lg leading-relaxed text-chalk/85">{t.sizeNote}</p>
      <form onSubmit={onSubmit} className="mt-12 max-w-xl border-t-4 border-signal pt-8" noValidate>
        <h2 className="font-display text-3xl leading-none tracking-tight">{t.order}</h2>
        <p className="mt-3 font-serif text-base text-chalk/80">{t.pay}</p>
        <div className="mt-8 grid gap-5">
          <fieldset className="grid gap-2">
            <legend className="font-ui text-[0.68rem] uppercase tracking-[0.18em] text-chalk/80">{t.piece}</legend>
            <div className="flex flex-wrap gap-2">
              <Choice on={piece === "tee"} onClick={() => setPiece("tee")}>
                {t.tee}
              </Choice>
              <Choice on={piece === "hoodie"} onClick={() => setPiece("hoodie")}>
                {t.hoodie}
              </Choice>
            </div>
          </fieldset>
          <fieldset className="grid gap-2">
            <legend className="font-ui text-[0.68rem] uppercase tracking-[0.18em] text-chalk/80">{t.size}</legend>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((option) => (
                <Choice key={option} on={size === option} onClick={() => setSize(option)}>
                  {option}
                </Choice>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-2">
            <Label htmlFor="shop-name">{t.name}</Label>
            <Input id="shop-name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shop-email">{t.email}</Label>
            <Input
              id="shop-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shop-note">{t.note}</Label>
            <textarea
              id="shop-note"
              name="note"
              rows={3}
              value={note}
              placeholder={t.notePlaceholder}
              onChange={(event) => setNote(event.target.value)}
              className="w-full border border-chalk/45 bg-field/40 px-3 py-3 font-serif text-base text-chalk outline-none placeholder:text-quiet focus-visible:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            />
          </div>
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="shop-company">Company</label>
            <input id="shop-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
            {status === "sending" ? t.sending : t.send}
          </Button>
          <p role={status === "error" ? "alert" : "status"} className="min-h-6 font-serif text-base text-chalk/85">
            {message}
          </p>
        </div>
      </form>
    </section>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "h-11 border px-4 font-ui text-[0.72rem] uppercase tracking-[0.16em]",
        on ? "border-signal bg-signal text-ink" : "border-chalk/45 bg-transparent text-chalk",
      )}
    >
      {children}
    </button>
  );
}

function PieceCard({ label, piece }: { label: string; piece: Piece }) {
  return (
    <figure className="border border-chalk/15">
      <div className="relative flex aspect-[4/5] items-center justify-center bg-[#f7f4ea]">
        {piece === "tee" ? <Tee /> : <Hoodie />}
        <div className="pointer-events-none absolute top-[46%] left-1/2 w-[42%] -translate-x-1/2 -translate-y-[42%]">
          <Lockup size="shop" />
        </div>
        <span className="absolute inset-x-0 bottom-0 h-1 bg-signal" aria-hidden="true" />
      </div>
      <figcaption className="px-4 py-4 font-ui text-[0.72rem] uppercase tracking-[0.18em] text-chalk">
        {label}
      </figcaption>
    </figure>
  );
}

function Tee() {
  return (
    <svg viewBox="0 0 320 400" className="h-[78%] w-auto" aria-hidden="true">
      <path
        fill="#111111"
        d="M108 92c8-28 96-28 104 0l42-16 36 40-40 30-18-28v222H88V118l-18 28-40-30 36-40z"
      />
    </svg>
  );
}

function Hoodie() {
  return (
    <svg viewBox="0 0 320 400" className="h-[82%] w-auto" aria-hidden="true">
      <path
        fill="#111111"
        d="M160 42c-28 0-40 28-34 52l-46 8-48 92 38 18 28-72v188h132V140l28 72 38-18-48-92-46-8c6-24-6-52-34-52-10 22-28 22-38 0z"
      />
      <path
        d="M118 250h84v62H118z"
        fill="none"
        stroke="#f7f4ea"
        strokeWidth="3"
      />
    </svg>
  );
}
