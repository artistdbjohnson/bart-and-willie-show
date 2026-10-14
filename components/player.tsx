"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { NowPlaying } from "@/lib/now-playing";

type Mode = "spotify" | "audio";
type SpotifyController = {
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  addListener: (event: string, cb: (e: { data: Record<string, unknown> }) => void) => void;
};
type State = {
  episode: NowPlaying | null;
  mode: Mode;
  playing: boolean;
  loading: boolean;
  position: number;
  duration: number;
  rate: number;
  preview: boolean;
  toggle: () => void;
  skip: (seconds: number) => void;
  seek: (seconds: number) => void;
  cycleRate: () => void;
};

const PlayerContext = createContext<State | null>(null);
export const usePlayer = () => useContext(PlayerContext);

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: {
      createController: (el: HTMLElement, opts: Record<string, unknown>, cb: (c: SpotifyController) => void) => void;
    }) => void;
  }
}

const RATES = [1, 1.5, 2];

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [episode, setEpisode] = useState<NowPlaying | null>(null);
  const [mode, setMode] = useState<Mode>("spotify");
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [preview, setPreview] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SpotifyController | null>(null);
  const modeRef = useRef<Mode>("spotify");
  const watchdog = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    fetch("/api/now-playing")
      .then((r) => r.json())
      .then((data: NowPlaying) => {
        setEpisode(data);
        if (data.duration) setDuration(data.duration);
        if (!data.spotifyEpisode) {
          modeRef.current = "audio";
          setMode("audio");
        }
      })
      .catch(() => undefined);
  }, []);

  const toAudio = useCallback((at: number, play: boolean) => {
    if (modeRef.current === "audio") return;
    modeRef.current = "audio";
    setMode("audio");
    setPreview(true);
    try {
      controller.current?.pause();
    } catch {
      /* ignore */
    }
    const el = audio.current;
    if (!el) return;
    el.currentTime = at;
    if (play) {
      setLoading(true);
      el.play().catch(() => setLoading(false));
    }
  }, []);

  // Spotify iFrame API controller, hidden; our controls drive it.
  useEffect(() => {
    if (!episode?.spotifyEpisode || !host.current) return;
    const mount = host.current;
    window.onSpotifyIframeApiReady = (api) => {
      const target = document.createElement("div");
      mount.appendChild(target);
      api.createController(target, { uri: `spotify:episode:${episode.spotifyEpisode}`, width: 300, height: 80 }, (c) => {
        controller.current = c;
        c.addListener("playback_update", (e) => {
          if (modeRef.current !== "spotify") return;
          const d = e.data as { isPaused: boolean; isBuffering: boolean; duration: number; position: number };
          if (watchdog.current) window.clearTimeout(watchdog.current);
          if (d.duration > 0 && d.duration <= 35_000 && started.current) {
            toAudio(d.position / 1000, !d.isPaused);
            return;
          }
          if (d.duration > 0) setDuration(d.duration / 1000);
          setPosition(d.position / 1000);
          setPlaying(!d.isPaused);
          setLoading(d.isBuffering);
        });
      });
    };
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [episode?.spotifyEpisode, toAudio]);

  const toggle = useCallback(() => {
    if (!episode) return;
    started.current = true;
    if (modeRef.current === "spotify" && controller.current) {
      setLoading(!playing);
      controller.current.togglePlay();
      if (watchdog.current) window.clearTimeout(watchdog.current);
      // No playback from Spotify in 5s (blocked, logged out, region): use the public RSS audio.
      if (!playing) watchdog.current = window.setTimeout(() => toAudio(position, true), 5000);
      return;
    }
    const el = audio.current;
    if (!el) return;
    if (modeRef.current === "spotify") {
      modeRef.current = "audio";
      setMode("audio");
    }
    if (el.paused) {
      setLoading(true);
      el.play().catch(() => setLoading(false));
    } else el.pause();
  }, [episode, playing, position, toAudio]);

  const seek = useCallback(
    (seconds: number) => {
      const t = Math.max(0, Math.min(seconds, duration || seconds));
      setPosition(t);
      if (modeRef.current === "spotify" && controller.current) controller.current.seek(t);
      else if (audio.current) audio.current.currentTime = t;
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
    <PlayerContext.Provider value={{ episode, mode, playing, loading, position, duration, rate, preview, toggle, skip, seek, cycleRate }}>
      {children}
      <div ref={host} aria-hidden="true" className="pointer-events-none fixed -left-[400px] bottom-0 h-20 w-[300px] opacity-0" />
      {episode?.audio ? (
        <audio
          ref={audio}
          src={episode.audio}
          preload="none"
          onPlaying={() => {
            setPlaying(true);
            setLoading(false);
          }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onTimeUpdate={(e) => modeRef.current === "audio" && setPosition(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (modeRef.current === "audio" && Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
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
  const { episode, playing, loading, position, duration, mode, rate, preview } = p;
  const pct = duration ? Math.min(100, (position / duration) * 100) : 0;
  return (
    <div className={`nav-player ${className}`} aria-label="Latest episode player" role="group">
      <button type="button" className="np-btn hidden sm:flex" aria-label="Back 15 seconds" onClick={() => p.skip(-15)} disabled={!episode}>
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
      <button type="button" className="np-btn hidden sm:flex" aria-label="Forward 15 seconds" onClick={() => p.skip(15)} disabled={!episode}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3l4 3-4 3V7.2A3.8 3.8 0 1 0 11.8 11" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
      </button>
      <div className="np-body">
        <p className="np-title hidden md:block" title={episode?.title}>{episode ? episode.title : "Loading latest episode…"}</p>
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
          <span className="np-time">-{clock(Math.max(0, duration - position))}</span>
        </div>
      </div>
      {mode === "audio" ? (
        <button type="button" className="np-rate hidden sm:block" aria-label={`Playback speed ${rate}x`} onClick={p.cycleRate}>
          {rate}x
        </button>
      ) : null}
      {episode ? (
        <a
          href={episode.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`np-spotify ${preview ? "is-strong" : ""} hidden lg:inline`}
        >
          Open in Spotify
        </a>
      ) : null}
    </div>
  );
}
