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
  loadModule: (name: string) => void;
  unloadModule: (name: string) => void;
  setOption: (module: string, option: string, value: unknown) => void;
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

const EMBED_ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

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
  const mount = document.createElement("div");
  mount.className = "h-full w-full";
  parent.replaceChildren(mount);
  // The API inserts the iframe. Set the referrer policy inside createElement,
  // before it assigns src, or YouTube answers 153/150 and the Short never starts.
  const create = document.createElement.bind(document);
  document.createElement = ((tag: string, options?: ElementCreationOptions) => {
    const element = create(tag, options);
    if (String(tag).toLowerCase() === "iframe" && element instanceof HTMLIFrameElement) {
      element.referrerPolicy = "strict-origin-when-cross-origin";
      element.allow = EMBED_ALLOW;
      element.setAttribute("playsinline", "1");
      element.setAttribute("webkit-playsinline", "1");
    }
    return element;
  }) as typeof document.createElement;
  try {
    return new window.YT.Player(mount, {
      videoId,
      width,
      height,
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        ...vars,
        origin: window.location.origin,
      },
      events,
    });
  } finally {
    document.createElement = create;
  }
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

/** Force the caption track off. cc_load_policy 0 still follows the viewer's preference. */
export function silenceCaptions(player: YoutubePlayer) {
  try {
    player.unloadModule("captions");
  } catch {
    /* the module is not up yet */
  }
  try {
    player.setOption("captions", "track", {});
  } catch {
    /* captions are not available on this player yet */
  }
}
