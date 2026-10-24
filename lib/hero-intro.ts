export const HERO_INTRO_KEY = "baw-hero-intro";

export const heroIntros = {
  a: { src: "/hero/intro.mp4", poster: "/hero/intro-poster.jpg" },
  b: { src: "/hero/intro-v2-clean.mp4", poster: "/hero/intro-v2-poster.jpg" },
} as const;

export type HeroIntroId = keyof typeof heroIntros;

function isHeroIntroId(value: string | null): value is HeroIntroId {
  return value === "a" || value === "b";
}

/**
 * The head script picks before paint on a full home load. This covers a
 * return to the homepage in the same document, and does not flip again.
 */
export function ensureHeroIntro(): HeroIntroId {
  const root = document.documentElement;
  const ready = root.getAttribute("data-hero-intro");
  if (isHeroIntroId(ready)) return ready;
  const choice = takeNextHeroIntro();
  root.setAttribute("data-hero-intro", choice);
  return choice;
}

export function applyHeroIntro(video: HTMLVideoElement, id: HeroIntroId) {
  const media = heroIntros[id];
  if (video.getAttribute("poster") !== media.poster) video.poster = media.poster;
  if (video.getAttribute("src") !== media.src) {
    video.muted = true;
    video.src = media.src;
  }
  video.muted = true;
  if (video.paused) {
    const pending = video.play();
    if (pending) pending.catch(() => {});
  }
}

function takeNextHeroIntro(): HeroIntroId {
  try {
    const previous = localStorage.getItem(HERO_INTRO_KEY);
    const choice: HeroIntroId = previous === "b" ? "a" : "b";
    localStorage.setItem(HERO_INTRO_KEY, choice);
    return choice;
  } catch {
    return takeNextHeroIntroFallback();
  }
}

const FALLBACK_COOKIE = "baw-hero-intro";

function readFallback(): HeroIntroId | null {
  try {
    const match = document.cookie.match(/(?:^|; )baw-hero-intro=(a|b)(?:;|$)/);
    if (match && isHeroIntroId(match[1])) return match[1];
  } catch {
    /* cookies blocked */
  }
  return null;
}

function writeFallback(choice: HeroIntroId) {
  try {
    document.cookie = `${FALLBACK_COOKIE}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax`;
  } catch {
    /* cookies blocked */
  }
}

function takeNextHeroIntroFallback(): HeroIntroId {
  const choice: HeroIntroId = readFallback() === "b" ? "a" : "b";
  writeFallback(choice);
  return choice;
}

/**
 * Runs from the document head, before paint. localStorage remembers the
 * last intro. The new intro (b) plays first; the original (a) follows.
 * If Storage throws, a cookie keeps the next refresh in turn.
 */
export const heroIntroBoot = `
try {
  var heroPath = location.pathname.replace(/\\/$/, '') || '/';
  if (heroPath === '/') {
    var heroIntro = 'b';
    try {
      var prevHero = localStorage.getItem('${HERO_INTRO_KEY}');
      heroIntro = prevHero === 'b' ? 'a' : 'b';
      localStorage.setItem('${HERO_INTRO_KEY}', heroIntro);
    } catch (heroErr) {
      var heroPrev = null;
      try {
        var heroMatch = document.cookie.match(/(?:^|; )baw-hero-intro=(a|b)(?:;|$)/);
        if (heroMatch) heroPrev = heroMatch[1];
      } catch (e1) {}
      heroIntro = heroPrev === 'b' ? 'a' : 'b';
      try {
        document.cookie = '${FALLBACK_COOKIE}=' + heroIntro + '; Path=/; Max-Age=31536000; SameSite=Lax';
      } catch (e2) {}
    }
    document.documentElement.setAttribute('data-hero-intro', heroIntro);
  }
} catch (e) {}
`;

export const heroIntroBind = `(function(){var id=document.documentElement.getAttribute('data-hero-intro');if(id!=='a'&&id!=='b')return;var v=document.getElementById('hero-intro');if(!v)return;var src=id==='b'?'${heroIntros.b.src}':'${heroIntros.a.src}';var poster=id==='b'?'${heroIntros.b.poster}':'${heroIntros.a.poster}';if(v.getAttribute('src')!==src){v.poster=poster;v.muted=true;v.src=src;v.muted=true;}})();`;
