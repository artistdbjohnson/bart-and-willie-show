export type YoutubePlayer = {
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YoutubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      width?: string | number;
      height?: string | number;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YoutubePlayer }) => void;
        onStateChange?: (event: { data: number; target: YoutubePlayer }) => void;
        onError?: (event: { data: number }) => void;
      };
    },
  ) => YoutubePlayer;
};

declare global {
  interface Window {
    YT?: YoutubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loading: Promise<YoutubeNamespace> | null = null;

export function attachPlayer(
  parent: HTMLElement,
  videoId: string,
  vars: Record<string, string | number>,
  events: {
    onReady?: (event: { target: YoutubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YoutubePlayer }) => void;
    onError?: (event: { data: number }) => void;
  },
) {
  if (!window.YT?.Player) throw new Error("YouTube player is not ready");
  const width = Math.max(2, Math.round(parent.clientWidth));
  const height = Math.max(2, Math.round(parent.clientHeight));
  const iframe = document.createElement("iframe");
  iframe.className = "h-full w-full";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.setAttribute("allowfullscreen", "true");
  iframe.width = String(width);
  iframe.height = String(height);
  const params = new URLSearchParams({ enablejsapi: "1" });
  for (const [key, value] of Object.entries(vars)) params.set(key, String(value));
  params.set("origin", window.location.origin);
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
  parent.replaceChildren(iframe);
  return new window.YT.Player(iframe, { width, height, events });
}

export function loadYoutube() {
  if (typeof window === "undefined") return Promise.reject(new Error("YouTube player is browser-only"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    if (!document.querySelector("script[data-yt-iframe]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.ytIframe = "1";
      document.head.appendChild(script);
    }
  });
  return loading;
}

export const PLAYER_PLAYING = 1;
export const PLAYER_ENDED = 0;
export const PLAYER_PAUSED = 2;
