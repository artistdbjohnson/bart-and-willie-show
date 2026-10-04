import type { Locale } from "@/lib/paths";

export const copy = {
  en: {
    skip: "Skip to content",
    nav: {
      episodes: "Episodes",
      jets: "Jets",
      hosts: "Hosts",
      list: "The list",
      menu: "Menu",
      close: "Close",
    },
    lang: { en: "EN", pt: "PT", label: "Language" },
    theme: { day: "Day", night: "Night", label: "Field" },
    hero: {
      kicker: "New episodes on Mondays and Fridays",
      lede: "Bart Scott. Willie Colon. Former Jets. On twice a week.",
      opening: "Latest title card. Play opens YouTube.",
      mute: "Mute",
      unmute: "Unmute",
      watch: "Watch the full episode",
      channel: "The YouTube channel",
      unavailable: "The channel feed did not load. The show is still on YouTube.",
    },
    stats: [
      { value: "Mon & Fri", label: "New episodes" },
      { value: "Scott & Colon", label: "The desk" },
      { value: "Jets", label: "The club" },
    ],
    episodes: {
      kicker: "Episodes",
      title: "Latest",
      featured: "Featured",
      featuredLine: "The Friday show. Jets, the Browns, Watson, and Brady’s tell-all. Hit play.",
      open: "Watch on YouTube",
      empty: "The YouTube feed did not load, so there are no episode titles on this page.",
      channel: "Open the channel",
      restEmpty: "The rest of the full episodes are not in this window of the feed.",
      short: "Short",
      episode: "Episode",
    },
    channel: {
      kicker: "YouTube",
      title: "From the channel",
      lede: "Newest first. Titles as they ran them.",
      previous: "Previous videos",
      next: "Next videos",
      region: "Recent uploads",
      empty: "The YouTube feed did not load. No stand-in titles are listed.",
      views: "views",
    },
    instagram: {
      kicker: "Instagram",
      title: "On the profile",
      lede: "A row from the account. Not the whole feed.",
      previous: "Previous posts",
      next: "Next posts",
      region: "Instagram posts",
      post: "Post",
      clip: "Clip",
      profile: "The rest of the profile",
      pause: "Pause",
      play: "Play",
      thePost: "The post",
      empty:
        "Instagram did not return a public feed to this page. Nothing here is a stand-in post.",
      count: (shown: number, total: number | null) =>
        total == null ? `${shown}` : `${shown} of ${total}`,
    },
    jets: {
      kicker: "Former New York Jets",
      title: "The Jets years",
      lede: "Both of them played here. The show still says the name. What follows is the club’s profiles and the public record. Nothing added.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
      onTheShow: "On the show",
      onTheShowLede:
        "On this page when the title or a chapter says Jets. The channel’s closing hashtag does not count.",
      none: "This window of the feed does not name the Jets in a title or a chapter.",
      hosts: "Full host notes",
      chapter: "Oct 2, 2026. Chapter title: “Jets Vibe Check.”",
    },
    about: {
      kicker: "Hosts",
      title: "Scott and Colon",
      lede: "What the public bios say. The Jets years sit in the middle of each note, because that is the stretch this show keeps.",
      sources: "Sources",
    },
    list: {
      kicker: "The list",
      title: "Your name. Their list.",
      lede: "Mondays and Fridays, straight from the show. Your name and your email stay here. Not on YouTube. Not in somebody else’s funnel.",
      name: "Name",
      email: "Email",
      submit: "Join the list",
      export: "Download CSV",
      saved: "You’re on the list. Mondays and Fridays.",
      failed: "That one didn’t go through. Try the email again.",
      note: "One note when a show drops. Leave whenever you want.",
    },
    footer: {
      watch: "Watch",
      visit: "Visit",
      pages: "Pages",
      credit: "built by dglxss",
      schedule: "New episodes on Mondays and Fridays.",
    },
    notFound: {
      title: "That page is not on the field.",
      home: "Back to the show",
    },
    meta: {
      home: {
        title: "The Bart & Willie Show",
        description:
          "Bart Scott and Willie Colon, former New York Jets, with new episodes Mondays and Fridays.",
      },
      episodes: {
        title: "Episodes · The Bart & Willie Show",
        description: "Recent episodes and uploads from the show’s YouTube channel.",
      },
      jets: {
        title: "The Jets years · The Bart & Willie Show",
        description:
          "Bart Scott and Willie Colon’s seasons with the New York Jets, from their published bios.",
      },
      about: {
        title: "Hosts · The Bart & Willie Show",
        description:
          "Bart Scott and Willie Colon, from their sports and media biographies.",
      },
      list: {
        title: "The list · The Bart & Willie Show",
        description:
          "Mondays and Fridays, straight from the show. Your name and your email stay here. Not on YouTube. Not in somebody else’s funnel.",
      },
    },
  },
  pt: {
    skip: "Pular para o conteúdo",
    nav: {
      episodes: "Episódios",
      jets: "Jets",
      hosts: "Apresentadores",
      list: "A lista",
      menu: "Menu",
      close: "Fechar",
    },
    lang: { en: "EN", pt: "PT", label: "Idioma" },
    theme: { day: "Dia", night: "Noite", label: "Campo" },
    hero: {
      kicker: "Novos episódios às segundas e sextas",
      lede: "Bart Scott. Willie Colon. Ex-Jets. Duas vezes por semana.",
      opening: "Cartaz do episódio mais recente. O play abre no YouTube.",
      mute: "Mudo",
      unmute: "Som",
      watch: "Ver o episódio inteiro",
      channel: "O canal no YouTube",
      unavailable: "A fonte do canal não carregou. O programa continua no YouTube.",
    },
    stats: [
      { value: "Seg e sex", label: "Novos episódios" },
      { value: "Scott e Colon", label: "A bancada" },
      { value: "Jets", label: "O clube" },
    ],
    episodes: {
      kicker: "Episódios",
      title: "Mais recente",
      featured: "Em destaque",
      featuredLine: "O programa de sexta. Jets, Browns, Watson e o tell-all do Brady. Dá o play.",
      open: "Assistir no YouTube",
      empty: "A fonte do YouTube não carregou, então não há títulos de episódio nesta página.",
      channel: "Abrir o canal",
      restEmpty: "O restante dos episódios longos não está nesta janela da fonte.",
      short: "Short",
      episode: "Episódio",
    },
    channel: {
      kicker: "YouTube",
      title: "Do canal",
      lede: "Os mais novos primeiro. Os títulos são os que eles publicaram.",
      previous: "Vídeos anteriores",
      next: "Próximos vídeos",
      region: "Envios recentes",
      empty: "A fonte do YouTube não carregou. Nenhum título foi inventado.",
      views: "visualizações",
    },
    instagram: {
      kicker: "Instagram",
      title: "No perfil",
      lede: "Uma faixa da conta. Não é o feed inteiro.",
      previous: "Publicações anteriores",
      next: "Próximas publicações",
      region: "Publicações do Instagram",
      post: "Post",
      clip: "Clipe",
      profile: "O resto do perfil",
      pause: "Pausa",
      play: "Tocar",
      thePost: "A publicação",
      empty:
        "O Instagram não devolveu uma fonte pública para esta página. Nada aqui é uma publicação inventada.",
      count: (shown: number, total: number | null) =>
        total == null ? `${shown}` : `${shown} de ${total}`,
    },
    jets: {
      kicker: "Ex-jogadores do New York Jets",
      title: "Os anos nos Jets",
      lede: "Os dois jogaram aqui. O programa ainda diz o nome. O que vem abaixo está no perfil do clube e no registro público. Nada acrescentado.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
      onTheShow: "No programa",
      onTheShowLede:
        "Entra nesta página quando o título ou um capítulo diz Jets. A hashtag do fim do vídeo não conta.",
      none: "Esta janela da fonte não cita os Jets num título ou num capítulo.",
      hosts: "Notas completas dos apresentadores",
      chapter: "2 de outubro de 2026. Título do capítulo: “Jets Vibe Check.”",
    },
    about: {
      kicker: "Apresentadores",
      title: "Scott e Colon",
      lede: "O que as bios públicas dizem. Os anos nos Jets ficam no meio de cada nota, porque é esse o trecho que o programa guarda.",
      sources: "Fontes",
    },
    list: {
      kicker: "A lista",
      title: "Seu nome. A lista deles.",
      lede: "Segundas e sextas, direto do programa. Nome e e-mail ficam aqui. Não vão para o YouTube. Não entram no funil de ninguém.",
      name: "Nome",
      email: "E-mail",
      submit: "Entrar na lista",
      export: "Download CSV",
      saved: "Você está na lista. Segundas e sextas.",
      failed: "Não entrou. Confere o e-mail e tenta de novo.",
      note: "Um aviso quando o programa sair. Sai quando quiser.",
    },
    footer: {
      watch: "Assistir",
      visit: "Visitar",
      pages: "Páginas",
      credit: "built by dglxss",
      schedule: "Novos episódios às segundas e sextas.",
    },
    notFound: {
      title: "Essa página não está no campo.",
      home: "Voltar ao programa",
    },
    meta: {
      home: {
        title: "The Bart & Willie Show",
        description:
          "Bart Scott e Willie Colon, ex-jogadores do New York Jets, com episódios novos às segundas e sextas.",
      },
      episodes: {
        title: "Episódios · The Bart & Willie Show",
        description: "Episódios e envios recentes do canal de YouTube do programa.",
      },
      jets: {
        title: "Os anos nos Jets · The Bart & Willie Show",
        description:
          "As temporadas de Bart Scott e Willie Colon no New York Jets, a partir das biografias publicadas.",
      },
      about: {
        title: "Apresentadores · The Bart & Willie Show",
        description:
          "Bart Scott e Willie Colon, a partir das biografias de esporte e de mídia.",
      },
      list: {
        title: "A lista · The Bart & Willie Show",
        description:
          "Segundas e sextas, direto do programa. Nome e e-mail ficam aqui. Não vão para o YouTube. Não entram no funil de ninguém.",
      },
    },
  },
} as const;

export function useCopy(locale: Locale) {
  return copy[locale];
}

export function formatWhen(iso: string, locale: Locale) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatViews(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US").format(value);
}
