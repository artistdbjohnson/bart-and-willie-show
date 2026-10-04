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
      kicker: "New episodes on Mondays & Fridays",
      lede: "Bart Scott and Willie Colon. Former New York Jets. Football, twice a week.",
      opening: "Title frame of the latest episode. Play opens it on YouTube.",
      watch: "Watch the full episode",
      channel: "YouTube channel",
      unavailable: "The channel feed did not load. The show is still on YouTube.",
    },
    stats: [
      { value: "Mon & Fri", label: "New episodes" },
      { value: "Two", label: "Hosts" },
      { value: "Jets", label: "Where they played" },
    ],
    episodes: {
      kicker: "Episodes",
      title: "Latest",
      featured: "Featured",
      open: "Open on YouTube",
      playHere: "Play in this frame",
      empty: "The YouTube feed did not load, so there are no episode titles on this page.",
      channel: "Open the channel",
      restEmpty: "The rest of the full episodes are not in this window of the feed.",
      short: "Short",
      episode: "Episode",
    },
    channel: {
      kicker: "YouTube",
      title: "From the channel",
      lede: "Titles, pictures, and links from the public channel feed. Newest first.",
      previous: "Previous videos",
      next: "Next videos",
      region: "Recent uploads",
      empty: "The YouTube feed did not load. No stand-in titles are listed.",
      views: "views on the feed",
    },
    instagram: {
      kicker: "Instagram",
      title: "On the profile",
      lede: "Posts the public profile returned. The account has more than this row.",
      previous: "Previous posts",
      next: "Next posts",
      region: "Instagram posts",
      post: "Post",
      clip: "Clip",
      profile: "The rest of the profile",
      empty:
        "Instagram did not return a public feed to this page. Nothing here is a stand-in post.",
      count: (shown: number, total: number | null) =>
        total && total > shown
          ? `Showing ${shown} of ${total} posts the profile reported.`
          : `Showing ${shown} posts the profile returned.`,
    },
    jets: {
      kicker: "Former New York Jets",
      title: "The Jets years",
      lede: "Both hosts played for the Jets, and the show still says so by name. This is that stretch of their careers, from the club’s profiles and the public record.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
      onTheShow: "On the show",
      onTheShowLede:
        "Listed when a title or a chapter in the public feed names the Jets. The channel’s standard closing hashtag is not treated as a segment.",
      none: "This window of the feed does not name the Jets in a title or a chapter.",
      hosts: "Full host notes",
      chapter: "Chapter on the Oct 2, 2026 upload: “Jets Vibe Check.”",
    },
    about: {
      kicker: "Hosts",
      title: "Scott and Colon",
      lede: "What the public sports bios actually say. The Jets seasons are in the middle of each note, where the show keeps them.",
      sources: "Sources",
    },
    list: {
      kicker: "The list",
      title: "Your name, their list",
      lede: "A name and an email for the show. It is not a YouTube follow button, and it is not a Mailchimp form.",
      name: "Name",
      email: "Email",
      submit: "Join the list",
      sending: "Saving",
      export: "Download CSV",
      nameError: "Add a name.",
      emailError: "That email does not look right.",
      genericError: "That did not save. Try again.",
      persisted: "You’re on the list this server can keep.",
      browser:
        "You’re on the list in this browser. This host has no database, so the row stays here until someone exports it from this browser.",
      duplicate: "That email was already on the list.",
      empty:
        "Nothing to export from this browser, and the server file has no rows.",
      note: "On a host that cannot write a file, the signup stays in this browser and the CSV is that browser’s list. The page says which one happened.",
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
        description: "Leave a name and email with the show, and export the list as CSV.",
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
      lede: "Bart Scott e Willie Colon. Ex-jogadores do New York Jets. Futebol americano, duas vezes por semana.",
      opening: "Quadro de título do episódio mais recente. Reproduzir abre no YouTube.",
      watch: "Ver o episódio inteiro",
      channel: "Canal no YouTube",
      unavailable: "A fonte do canal não carregou. O programa continua no YouTube.",
    },
    stats: [
      { value: "Seg & sex", label: "Novos episódios" },
      { value: "Dois", label: "Apresentadores" },
      { value: "Jets", label: "Onde jogaram" },
    ],
    episodes: {
      kicker: "Episódios",
      title: "Mais recente",
      featured: "Em destaque",
      open: "Abrir no YouTube",
      playHere: "Tocar neste quadro",
      empty: "A fonte do YouTube não carregou, então não há títulos de episódio nesta página.",
      channel: "Abrir o canal",
      restEmpty: "O restante dos episódios longos não está nesta janela da fonte.",
      short: "Short",
      episode: "Episódio",
    },
    channel: {
      kicker: "YouTube",
      title: "Do canal",
      lede: "Títulos, imagens e links da fonte pública do canal. Os mais novos primeiro.",
      previous: "Vídeos anteriores",
      next: "Próximos vídeos",
      region: "Envios recentes",
      empty: "A fonte do YouTube não carregou. Nenhum título foi inventado.",
      views: "visualizações na fonte",
    },
    instagram: {
      kicker: "Instagram",
      title: "No perfil",
      lede: "Publicações que o perfil público devolveu. A conta tem mais do que esta faixa.",
      previous: "Publicações anteriores",
      next: "Próximas publicações",
      region: "Publicações do Instagram",
      post: "Post",
      clip: "Clipe",
      profile: "O resto do perfil",
      empty:
        "O Instagram não devolveu uma fonte pública para esta página. Nada aqui é uma publicação inventada.",
      count: (shown: number, total: number | null) =>
        total && total > shown
          ? `Mostrando ${shown} de ${total} publicações que o perfil informou.`
          : `Mostrando ${shown} publicações que o perfil devolveu.`,
    },
    jets: {
      kicker: "Ex-jogadores do New York Jets",
      title: "Os anos nos Jets",
      lede: "Os dois apresentadores jogaram nos Jets, e o programa ainda diz isso pelo nome. Esta é essa parte da carreira, nos perfis do clube e no registro público.",
      bartYears: "Jets, 2009–2012",
      willieYears: "Jets, 2013–2015",
      bartTitle: "Bart Scott",
      willieTitle: "Willie Colon",
      onTheShow: "No programa",
      onTheShowLede:
        "Entram na lista quando um título ou um capítulo da fonte pública cita os Jets. A hashtag padrão do fim do vídeo não conta como quadro.",
      none: "Esta janela da fonte não cita os Jets num título ou num capítulo.",
      hosts: "Notas completas dos apresentadores",
      chapter: "Capítulo no envio de 2 de outubro de 2026: “Jets Vibe Check”.",
    },
    about: {
      kicker: "Apresentadores",
      title: "Scott e Colon",
      lede: "O que as biografias públicas de esporte realmente dizem. As temporadas nos Jets ficam no meio de cada nota, onde o programa as mantém.",
      sources: "Fontes",
    },
    list: {
      kicker: "A lista",
      title: "Seu nome, a lista deles",
      lede: "Um nome e um e-mail para o programa. Não é um botão de seguir no YouTube, nem um formulário do Mailchimp.",
      name: "Nome",
      email: "E-mail",
      submit: "Entrar na lista",
      sending: "Salvando",
      export: "Baixar CSV",
      nameError: "Inclua um nome.",
      emailError: "Esse e-mail não parece válido.",
      genericError: "Não foi possível salvar. Tente de novo.",
      persisted: "Você está na lista que este servidor consegue guardar.",
      browser:
        "Você está na lista neste navegador. Este host não tem banco de dados, então a linha fica aqui até alguém exportá-la deste navegador.",
      duplicate: "Esse e-mail já estava na lista.",
      empty: "Nada para exportar deste navegador, e o arquivo do servidor não tem linhas.",
      note: "Num host que não consegue gravar um arquivo, a inscrição fica neste navegador e o CSV é a lista desse navegador. A página diz qual dos dois aconteceu.",
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
        description: "Deixe um nome e um e-mail com o programa e exporte a lista em CSV.",
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
