"use client";

import { createPortal } from "react-dom";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { NowPlaying } from "@/lib/now-playing";

type State = {
  episode: NowPlaying | null;
  playing: boolean;
  loading: boolean;
  position: number;
  duration: number;
  rate: number;
  toggle: () => void;
  skip: (seconds: number) => void;
  seek: (seconds: number) => void;
  cycleRate: () => void;
  episodes: NowPlaying[];
  playEpisode: (ep: NowPlaying) => void;
};

const PlayerContext = createContext<State | null>(null);
export const usePlayer = () => useContext(PlayerContext);

const RATES = [1, 1.5, 2];

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [episode, setEpisode] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [episodes, setEpisodes] = useState<NowPlaying[]>([]);
  const audio = useRef<HTMLAudioElement>(null);
  const autoPlay = useRef(false);

  useEffect(() => {
    fetch("/api/episodes")
      .then((r) => r.json())
      .then((list: NowPlaying[]) => Array.isArray(list) && setEpisodes(list))
      .catch(() => undefined);
  }, []);

  const playEpisode = useCallback(
    (ep: NowPlaying) => {
      const el = audio.current;
      if (el && episode?.audio === ep.audio) {
        if (el.paused) {
          setLoading(true);
          el.play().catch(() => setLoading(false));
        }
        return;
      }
      autoPlay.current = true;
      setPlaying(false);
      setPosition(0);
      setDuration(ep.duration ?? 0);
      setLoading(true);
      setEpisode(ep);
    },
    [episode],
  );

  // A newly picked episode: start it once React has swapped the src in.
  useEffect(() => {
    const el = audio.current;
    if (!el || !autoPlay.current) return;
    autoPlay.current = false;
    el.load();
    el.playbackRate = rate;
    el.play().catch(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode]);

  useEffect(() => {
    fetch("/api/now-playing")
      .then((r) => r.json())
      .then((data: NowPlaying) => {
        setEpisode(data);
        if (data.duration) setDuration(data.duration);
      })
      .catch(() => undefined);
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      setLoading(true);
      el.play().catch(() => setLoading(false));
    } else el.pause();
  }, []);

  const seek = useCallback(
    (seconds: number) => {
      const t = Math.max(0, Math.min(seconds, duration || seconds));
      setPosition(t);
      if (audio.current) audio.current.currentTime = t;
    },
    [duration],
  );
  const skip = useCallback((s: number) => seek(position + s), [position, seek]);
  const cycleRate = useCallback(() => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    setRate(next);
    if (audio.current) audio.current.playbackRate = next;
  }, [rate]);

  // Lock-screen controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !episode) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: "The Bart & Willie Show",
      artwork: [{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => !playing && toggle());
    navigator.mediaSession.setActionHandler("pause", () => playing && toggle());
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(15));
    navigator.mediaSession.setActionHandler("seekto", (d) => d.seekTime != null && seek(d.seekTime));
  }, [episode, playing, toggle, skip, seek]);

  return (
    <PlayerContext.Provider value={{ episode, playing, loading, position, duration, rate, toggle, skip, seek, cycleRate, episodes, playEpisode }}>
      {children}
      {episode?.audio ? (
        <audio
          ref={audio}
          src={episode.audio}
          preload="metadata"
          onPlaying={() => {
            setPlaying(true);
            setLoading(false);
          }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
            e.currentTarget.playbackRate = rate;
          }}
        />
      ) : null}
    </PlayerContext.Provider>
  );
}

function clock(s: number) {
  const t = Math.max(0, Math.floor(s));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function NavPlayer({ className = "" }: { className?: string }) {
  const p = usePlayer();
  if (!p) return null;
  const { episode, playing, loading, position, duration, rate } = p;
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
  return (
    <div className={`nav-player ${className}`} aria-label="Latest episode player" role="group">
      <button type="button" className="np-btn np-skip" aria-label="Back 15 seconds" onClick={() => p.skip(-15)} disabled={!episode}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7 3 3 6l4 3V7.2A3.8 3.8 0 1 1 4.2 11" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
      </button>
      <button
        type="button"
        className="np-btn np-play"
        aria-label={playing ? "Pause" : "Play latest episode"}
        aria-busy={loading}
        onClick={p.toggle}
        disabled={!episode}
      >
        {loading ? (
          <span className="np-spin" aria-hidden="true" />
        ) : playing ? (
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h2v10H5zM9 3h2v10H9z" fill="currentColor" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10l8-5z" fill="currentColor" /></svg>
        )}
      </button>
      <button type="button" className="np-btn np-skip" aria-label="Forward 15 seconds" onClick={() => p.skip(15)} disabled={!episode}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3l4 3-4 3V7.2A3.8 3.8 0 1 0 11.8 11" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
      </button>
      <div className="np-body">
        <div className="np-track">
          <span className="np-time">{clock(position)}</span>
          <div className="np-line">
            <span className="np-fill" style={{ width: `${pct}%` }} />
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(duration))}
              step={1}
              value={Math.floor(position)}
              onChange={(e) => p.seek(Number(e.target.value))}
              aria-label="Seek"
              aria-valuetext={`${clock(position)} of ${clock(duration)}`}
              disabled={!episode}
            />
          </div>
          <span className="np-time np-remain">-{clock(Math.max(0, duration - position))}</span>
        </div>
        <Marquee text={episode ? episode.title : "Loading latest episode…"} />
      </div>
      <EpisodeMenu />
      <button type="button" className="np-rate" aria-label={`Playback speed ${rate}x`} onClick={p.cycleRate}>
        {rate}x
      </button>
    </div>
  );
}

function Marquee({ text }: { text: string }) {
  const box = useRef<HTMLDivElement>(null);
  const unit = useRef<HTMLSpanElement>(null);
  const [loop, setLoop] = useState<{ on: boolean; dur: number }>({ on: false, dur: 20 });
  useEffect(() => {
    let last = -1;
    const measure = () => {
      if (!box.current || !unit.current) return;
      const w = unit.current.offsetWidth; // text only
      const boxW = box.current.clientWidth;
      const key = w * 10000 + boxW;
      if (key === last) return;
      last = key;
      setLoop({ on: w > boxW + 1, dur: (w + GAP) / 30 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [text]);
  return (
    <div ref={box} className={`np-title ${loop.on ? "is-moving" : ""}`} title={text}>
      <span className="np-track-text" style={loop.on ? ({ ["--dur" as string]: `${loop.dur}s` } as React.CSSProperties) : undefined}>
        <span className="np-unit">
          <span ref={unit}>{text}</span>
        </span>
        {loop.on ? (
          <span className="np-unit" aria-hidden="true">
            {text}
          </span>
        ) : null}
      </span>
    </div>
  );
}

const GAP = 48;

const ET_DATE = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" });

function EpisodeMenu() {
  const p = usePlayer()!;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number; mobile: boolean } | null>(null);
  const [active, setActive] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const { episodes, episode, playing, loading } = p;
  const current = episodes.findIndex((e) => e.audio === episode?.audio);

  const place = useCallback(() => {
    const plate = btn.current?.closest(".site-header-plate") ?? btn.current?.closest("header");
    const b = btn.current?.closest(".nav-player")?.getBoundingClientRect();
    const top = plate ? plate.getBoundingClientRect().bottom : 64;
    void b;
    setPos({ top, right: 0, mobile: window.innerWidth < 640 });
  }, []);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) btn.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const start = current >= 0 ? current : 0;
    setActive(start);
    requestAnimationFrame(() => items.current[start]?.focus());
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || btn.current?.contains(t)) return;
      close(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    document.documentElement.classList.add("ep-open");
    const prev = document.body.style.overflow;
    if (window.innerWidth < 640) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("ep-open");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (i: number) => {
    const ep = episodes[i];
    if (!ep) return;
    p.playEpisode(ep);
    close(true);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const n = episodes.length;
    let next = active;
    if (e.key === "ArrowDown") next = (active + 1) % n;
    else if (e.key === "ArrowUp") next = (active - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
      return;
    } else if (e.key === "Tab") {
      close(false);
      return;
    } else return;
    e.preventDefault();
    setActive(next);
    items.current[next]?.focus();
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="np-btn np-list"
        aria-label="Episodes"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="np-episodes"
        onClick={() => setOpen((o) => !o)}
        disabled={!episodes.length}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 4.5h7M2 8h7M2 11.5h5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d={open ? "M11 9l2-2 2 2" : "M11 7l2 2 2-2"} fill="none" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={panel}
              className="ep-panel"
              style={{ top: pos.top, ["--ep-top" as string]: `${pos.top}px` } as React.CSSProperties}
            >
              <div className="ep-inner mx-auto max-w-6xl px-5 sm:px-8">
              <p className="ep-head" id="np-episodes-label">Latest episodes</p>
              <ul id="np-episodes" role="listbox" aria-labelledby="np-episodes-label" className="ep-list" onKeyDown={onListKey}>
                {episodes.map((ep, i) => {
                  const isCur = i === current;
                  const state = isCur ? (loading ? "Loading" : playing ? "Playing" : "Paused") : null;
                  return (
                    <li
                      key={ep.audio}
                      id={`np-ep-${i}`}
                      ref={(el) => {
                        items.current[i] = el;
                      }}
                      role="option"
                      aria-selected={isCur}
                      tabIndex={i === active ? 0 : -1}
                      className={`ep-row ${isCur ? "is-current" : ""}`}
                      onClick={() => pick(i)}
                    >
                      <span className="ep-mark" aria-hidden="true">
                        {isCur ? (
                          playing && !loading ? (
                            <span className="ep-bars"><i /><i /><i /></span>
                          ) : (
                            <svg viewBox="0 0 12 12"><path d="M3.5 2.5v7l6-3.5z" fill="currentColor" /></svg>
                          )
                        ) : null}
                      </span>
                      <span className="ep-main">
                        <span className="ep-meta">
                          {ep.date ? ET_DATE.format(new Date(ep.date)) : ""}
                          {state ? <span className="ep-state"> · {state}</span> : null}
                        </span>
                        <span className="ep-title">{ep.title}</span>
                      </span>
                      <span className="ep-dur">{ep.duration ? clock(ep.duration) : ""}</span>
                    </li>
                  );
                })}
              </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
