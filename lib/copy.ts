import type { Locale } from "@/lib/paths";

export const copy = {
  en: {
    skip: "Skip to content",
    toTop: "Back to top",
    nav: {
      episodes: "Episodes",
      jets: "Jets",
      hosts: "Hosts",
      shop: "Shop",
      list: "Join the roster",
      menu: "Menu",
      close: "Close",
    },
    lang: { en: "EN", pt: "PT", label: "Language" },
    theme: { day: "Day", night: "Night", label: "Field" },
    hero: {
      kicker: "New episodes on Mondays and Fridays",
      lede: "Two NFL vets. Zero filter. New episodes dropping Mondays & Fridays all season long.",
      intro: [
        "Two NFL vets. Zero filter.",
        "New episodes dropping Mondays & Fridays all season long.",
      ],
      follow: "Follow us",
      follows: [
        { label: "YT", handle: "@bartandwillieshow", href: "https://www.youtube.com/@bartandwillieshow" },
        { label: "X", handle: "@bartandwillie", href: "https://x.com/bartandwillie" },
        { label: "IG", handle: "@bartandwillieshow", href: "https://www.instagram.com/bartandwillieshow" },
        { label: "TT", handle: "@bartandwillieshow", href: "https://www.tiktok.com/@bartandwillieshow" },
      ],
      opening: "From the Jets show, Oct 2.",
      stillAlt: "Aaron Rodgers in a Jets uniform, from the October 2 Jets show.",
      mute: "Mute",
      unmute: "Unmute",
      watch: "Watch the full episode",
      channel: "The YouTube channel",
      unavailable: "The channel feed didn’t load just now. Every episode is still on YouTube.",
    },
    episodes: {
      kicker: "Episodes",
      title: "Latest",
      featured: "Featured",
      featuredLine: "The Friday show opens on the Jets and the Browns, then turns to Watson and Brady’s tell-all.",
      open: "Watch on YouTube",
      empty: "The YouTube feed didn’t load just now. Every episode is on the channel.",
      channel: "Open the channel",
      restEmpty: "Older full episodes are on the channel.",
      short: "Short",
      episode: "Episode",
    },
    channel: {
      kicker: "YouTube",
      title: "From the channel",
      lede: "The newest uploads, titled the way the show titled them.",
      previous: "Previous videos",
      next: "Next videos",
      region: "Recent uploads",
      pause: "Pause",
      play: "Play",
      empty: "The YouTube feed didn’t load just now. The uploads are all on the channel.",
      views: "views",
    },
    instagram: {
      kicker: "Instagram",
      title: "On the profile",
      lede: "A few recent posts from the show’s account.",
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
        "Instagram didn’t share the feed with this page just now. The posts are on the profile.",
      count: (shown: number, total: number | null) =>
        total == null ? `${shown}` : `${shown} of ${total}`,
    },
    jets: {
      kicker: "Hosts · Former New York Jets",
      title: "The Jets years",
      lede: "Bart Scott and Willie Colon both wore green in New York, and their time there runs back to back: Colon signed with the Jets less than a month after Scott was released. These are their Jets years, told from the club’s own profiles and the public record.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
    },
    about: {
      kicker: "Hosts",
      title: "Scott and Colon",
      lede: "Both men came to New York from elsewhere in the league, and both stayed in front of a camera after they stopped playing. Here is how each of them got there.",
      sources: "Sources",
    },
    list: {
      kicker: "Join the roster",
      title: "Join the roster",
      lede: "When a new episode drops on a Monday or a Friday, you get one note about it. Your name and email stay with this site and go nowhere else.",
      name: "Name",
      email: "Email",
      no: "No.",
      pos: "Pos",
      fan: "Fan",
      submit: "Sign up and join the roster",
      export: "Download CSV",
      saved: "You’re on the roster ✓ The next note comes when a show drops.",
      failed: "That one didn’t go through. Try the email again.",
      note: "One note per episode. Unsubscribe whenever you like.",
    },
    shop: {
      kicker: "Shop",
      title: "Merch",
      lede: "The show’s mark, printed on a black tee and a black hoodie.",
      tee: "Black tee",
      hoodie: "Black hoodie",
      sizeNote: "Sizes run from S to XXL. Put yours on the order, and we’ll confirm with you before anything is made or paid for.",
      pay: "You won’t be charged on this page.",
      order: "Start an order",
      piece: "Piece",
      size: "Size",
      name: "Name",
      email: "Email",
      note: "Note",
      notePlaceholder: "Size, quantity, anything we should know.",
      send: "Send the order",
      sending: "Sending",
      sent: "Your order is started. We’ll confirm with you, and nothing has been charged.",
      failed: "That one didn’t go through. Try the email again.",
    },
    footer: {
      watch: "Watch",
      visit: "Visit",
      pages: "Pages",
      credit: "built by dglxss",
      schedule: "New episodes every Monday and Friday.",
    },
    notFound: {
      title: "That page is not on the field.",
      home: "Back to the show",
    },
    meta: {
      home: {
        title: "The Bart & Willie Show",
        description:
          "Two NFL vets. Zero filter. New episodes dropping Mondays & Fridays all season long.",
      },
      episodes: {
        title: "Episodes · The Bart & Willie Show",
        description: "The latest episodes and uploads from The Bart & Willie Show on YouTube.",
      },
      jets: {
        title: "The Jets years · The Bart & Willie Show",
        description:
          "How Bart Scott and Willie Colon came to the New York Jets and what their seasons there held, told from the club’s profiles and the public record.",
      },
      about: {
        title: "Hosts · The Bart & Willie Show",
        description:
          "Bart Scott and Willie Colon, from their playing days to the broadcast desk.",
      },
      shop: {
        title: "Shop · The Bart & Willie Show",
        description: "The show’s mark on a black tee and a black hoodie. Every order is confirmed before anyone pays.",
      },
      list: {
        title: "The list · The Bart & Willie Show",
        description:
          "Sign up for one note whenever a new episode drops on a Monday or a Friday.",
      },
    },
  },
  pt: {
    skip: "Pular para o conteúdo",
    toTop: "Voltar ao topo",
    nav: {
      episodes: "Episódios",
      jets: "Jets",
      hosts: "Apresentadores",
      shop: "Loja",
      list: "O elenco",
      menu: "Menu",
      close: "Fechar",
    },
    lang: { en: "EN", pt: "PT", label: "Idioma" },
    theme: { day: "Dia", night: "Noite", label: "Campo" },
    hero: {
      kicker: "Novos episódios às segundas e sextas",
      lede: "Bem-vindos ao The Bart & Willie Show, onde os amigos de longa data e ex-jogadores da NFL Bart Scott e Willie Colon destrincham os assuntos mais importantes da liga, às segundas e sextas. Inscreva-se para não perder nenhum drop!",
      intro: [
        "Bem-vindos ao The Bart & Willie Show, onde os amigos de longa data e ex-jogadores da NFL Bart Scott e Willie Colon destrincham os assuntos mais importantes da liga, às segundas e sextas.",
        "Inscreva-se para não perder nenhum drop!",
      ],
      follow: "Siga",
      follows: [
        { label: "YT", handle: "@bartandwillieshow", href: "https://www.youtube.com/@bartandwillieshow" },
        { label: "X", handle: "@bartandwillie", href: "https://x.com/bartandwillie" },
        { label: "IG", handle: "@bartandwillieshow", href: "https://www.instagram.com/bartandwillieshow" },
        { label: "TT", handle: "@bartandwillieshow", href: "https://www.tiktok.com/@bartandwillieshow" },
      ],
      opening: "Do programa dos Jets, 2 de outubro.",
      stillAlt: "Aaron Rodgers de uniforme dos Jets, do programa dos Jets de 2 de outubro.",
      mute: "Mudo",
      unmute: "Som",
      watch: "Ver o episódio inteiro",
      channel: "O canal no YouTube",
      unavailable: "A fonte do canal não carregou. O programa continua no YouTube.",
    },
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
      pause: "Pausa",
      play: "Tocar",
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
      kicker: "Apresentadores · Ex-jogadores do New York Jets",
      title: "Os anos nos Jets",
      lede: "Os dois jogaram aqui. O programa ainda diz o nome. O que vem abaixo está no perfil do clube e no registro público. Nada acrescentado.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
    },
    about: {
      kicker: "Apresentadores",
      title: "Scott e Colon",
      lede: "O que as bios públicas dizem. Os anos nos Jets ficam no meio de cada nota, porque é esse o trecho que o programa guarda.",
      sources: "Fontes",
    },
    list: {
      kicker: "O elenco",
      title: "Seu nome. O elenco deles.",
      lede: "Segundas e sextas, direto do programa. Nome e e-mail ficam aqui. Não vão para o YouTube. Não entram no funil de ninguém.",
      name: "Nome",
      email: "E-mail",
      no: "Nº",
      pos: "Pos",
      fan: "Fã",
      submit: "Cadastre-se e entre no elenco",
      export: "Download CSV",
      saved: "Você está no elenco ✓ Segundas e sextas.",
      failed: "Não entrou. Confere o e-mail e tenta de novo.",
      note: "Um aviso quando o programa sair. Sai quando quiser.",
    },
    shop: {
      kicker: "Loja",
      title: "Peças",
      lede: "A marca do programa numa camiseta preta e num moletom preto.",
      tee: "Camiseta preta",
      hoodie: "Moletom preto",
      sizeNote: "Os tamanhos são S, M, L, XL e XXL. O tamanho vai no pedido. Confirmamos antes de produzir ou cobrar.",
      pay: "Nada é cobrado nesta página.",
      order: "Começar um pedido",
      piece: "Peça",
      size: "Tamanho",
      name: "Nome",
      email: "E-mail",
      note: "Nota",
      notePlaceholder: "Tamanho, quantidade, o que a gente precisa saber.",
      send: "Enviar o pedido",
      sending: "Enviando",
      sent: "Pedido iniciado. Nada foi cobrado.",
      failed: "Não entrou. Confere o e-mail e tenta de novo.",
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
      shop: {
        title: "Loja · The Bart & Willie Show",
        description: "Camiseta preta e moletom preto com a marca do programa. Nada é cobrado nesta página.",
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
    timeZone: "America/New_York",
  }).format(date);
}

export function formatViews(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "pt" ? "pt-BR" : "en-US").format(value);
}
