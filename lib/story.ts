import type { Locale } from "@/lib/paths";

export const sources = [
  {
    href: "https://en.wikipedia.org/wiki/Bart_Scott",
    label: "Wikipedia · Bart Scott",
  },
  {
    href: "https://www.pro-football-reference.com/players/S/ScotBa20.htm",
    label: "Pro Football Reference · Bart Scott",
  },
  {
    href: "https://www.newyorkjets.com/news/where-are-they-now-bart-scott",
    label: "New York Jets · Bart Scott",
  },
  {
    href: "https://en.wikipedia.org/wiki/Willie_Colon_(American_football)",
    label: "Wikipedia · Willie Colon",
  },
  {
    href: "https://www.pro-football-reference.com/players/C/ColoWi20.htm",
    label: "Pro Football Reference · Willie Colon",
  },
  {
    href: "https://gohofstra.com/honors/hofstra-athletics-hall-of-fame/willie-colon/125",
    label: "Hofstra Athletics · Willie Colon",
  },
  {
    href: "https://www.newyorkjets.com/news/where-are-they-now-willie-colon",
    label: "New York Jets · Willie Colon",
  },
] as const;

type Block =
  | { type: "p"; text: string }
  | { type: "quote"; text: string; by: string; translation?: string };

export const jetsStory: Record<Locale, { bart: Block[]; willie: Block[] }> = {
  en: {
    bart: [
      { type: "p", text: "In late February 2009, Bart Scott followed his coach to New York. Rex Ryan had run his defense in Baltimore, and on February 27 Scott signed a six-year deal to play linebacker for him again, this time with the Jets." },
      {
        type: "quote",
        text: "That was my sole decision to sign with the Jets. No way I would have come to the Jets if Rex wasn't here. I would have stayed in Baltimore.",
        by: "Bart Scott, Jets profile, October 23, 2025",
      },
      { type: "p", text: "He arrived with four straight 100-tackle seasons behind him and made it five in green. That first year the Jets finished first in the NFL in total defense, something the franchise had never done before. Over his first two seasons the club won 20 of 32 regular-season games and reached the AFC Championship Game in 2009 and again in 2010." },
      { type: "p", text: "He played four seasons as a Jet, through 2012. The club released him on February 19, 2013, and later that year, after a total reconstruction of a big toe, he left the game." },
    ],
    willie: [
      { type: "p", text: "Willie Colon came home in March 2013. He had spent seven seasons in Pittsburgh and won a Super Bowl XLIII ring there, and when the call came from Rex Ryan he did not stay on the market long. On March 15 he signed a one-year deal with the Jets." },
      {
        type: "quote",
        text: "I was really a free agent for like 20 minutes. I got a call from Rex and he was like, ‘Hey, man, we know you're a New Yorker. It's time to come home.’",
        by: "Willie Colon, on the call from Rex Ryan, Jets profile, June 13, 2024",
      },
      { type: "p", text: "His first fall in New York opened with three wins in five games, and in Week 6 the Jets met the Steelers at home, the team he had just left. On March 19, 2014, the Jets brought him back for another year at $2 million. That season ended at 4–12, and Ryan was out as coach." },
      { type: "p", text: "Colon returned for a third year in 2015. In Week 8 against Oakland he hurt his knee, and 10 days later the Jets placed him on injured reserve. Hofstra Athletics counts 38 starts across his three seasons in New York. He retired in 2016." },
    ],
  },
  pt: {
    bart: [
      { type: "p", text: "27 de fevereiro de 2009. Bart Scott assinou com os Jets por seis anos e jogou de linebacker até 2012. O contrato o recolocou com Rex Ryan, seu técnico de defesa em Baltimore." },
      {
        type: "quote",
        text: "That was my sole decision to sign with the Jets. No way I would have come to the Jets if Rex wasn't here. I would have stayed in Baltimore.",
        by: "Bart Scott, perfil dos Jets, 23 de outubro de 2025",
        translation: "Essa foi a única razão de eu assinar com os Jets. Eu não teria vindo para os Jets se o Rex não estivesse aqui. Eu teria ficado em Baltimore.",
      },
      { type: "p", text: "O mesmo perfil: quatro temporadas seguidas de 100 tackles antes de chegar, e depois uma quinta. A defesa dos Jets em 2009 terminou em primeiro na NFL em defesa total, a primeira vez na história da franquia. Nas duas primeiras temporadas o clube venceu 20 de 32 jogos da temporada regular e chegou ao jogo do campeonato da AFC em 2009 e de novo em 2010. Quatro temporadas como Jet. Dispensado em 19 de fevereiro de 2013. O perfil diz que ele deixou o jogo em 2013 depois de uma reconstrução total de um dedão." },
    ],
    willie: [
      { type: "p", text: "15 de março de 2013. Willie Colon assinou por um ano com os Jets depois de sete temporadas em Pittsburgh e de um anel do Super Bowl XLIII. Em 19 de março de 2014 os Jets o trouxeram de volta por um ano, a US$ 2 milhões. Jogou 2013, 2014 e 2015. O atletismo de Hofstra diz que ele foi titular em 38 jogos nessas três temporadas e se aposentou em 2016." },
      {
        type: "quote",
        text: "I was really a free agent for like 20 minutes. I got a call from Rex and he was like, ‘Hey, man, we know you're a New Yorker. It's time to come home.’",
        by: "Willie Colon, sobre a ligação de Rex Ryan, perfil dos Jets, 13 de junho de 2024",
        translation: "Eu fui agente livre por uns 20 minutos. Recebi uma ligação do Rex e ele disse: “Ei, cara, a gente sabe que você é nova-iorquino. Está na hora de voltar para casa.”",
      },
      { type: "p", text: "O perfil dos Jets: um começo de 2013 com três vitórias em cinco jogos, um jogo em casa contra Pittsburgh na semana 6, e Ryan fora depois de uma temporada de 4–12 em 2014. Em 2015, seu terceiro ano em Nova York, uma lesão no joelho na semana 8 contra Oakland o colocou na reserva de lesionados 10 dias depois." },
    ],
  },
};

export const hostStory: Record<
  Locale,
  { bart: { before: Block[]; after: Block[] }; willie: { before: Block[]; after: Block[] } }
> = {
  en: {
    bart: {
      before: [
      { type: "p", text: "Bartholomew Edward Scott was born in Detroit on August 18, 1980. He went to Southeastern High School and then to Southern Illinois, where he later finished a degree in economics. No team drafted him in 2002, yet he spent the next seven years at linebacker for the Baltimore Ravens, through 2008, and in 2006 he made the Pro Bowl and the All-Pro second team." },
      ],
      after: [
      { type: "p", text: "He was already working on camera during his first Jets season, on Barking with Bart alongside Eric Allen. Wikipedia records what came after: NFL analysis for CBS, including The NFL Today from 2014, and a co-host’s chair on ESPN Radio in New York. The Jets’ 2025 profile adds a seat as a studio analyst on SNY’s Jets Post Game Live. His career totals differ between the Wikipedia infobox and its game table, so they are left off this page, and Pro Football Reference keeps the full record." },
      ],
    },
    willie: {
      before: [
      { type: "p", text: "Willie Colon was born in the Bronx on April 9, 1983. He went to Cardinal Hayes High School and on to Hofstra, and in 2006 Pittsburgh drafted him in the fourth round, 131st overall. He stayed with the Steelers through 2012, long enough to win Super Bowl XLIII with them, and Wikipedia credits him with 100 games, every one of them a start. Pro Football Reference keeps the rest of his record." },
      ],
      after: [
      { type: "p", text: "The Jets’ 2024 profile has him back with the club on television, as its pregame and postgame analyst on SportsNet New York. Wikipedia also lists him as an analyst on FS1’s First Things First: OT." },
      ],
    },
  },
  pt: {
    bart: {
      before: [
      { type: "p", text: "Antes dos Jets, Bart: Bartholomew Edward Scott nasceu em 18 de agosto de 1980, em Detroit. Southeastern High School. Southern Illinois, onde depois concluiu a graduação em economia. Não foi draftado em 2002. Linebacker do Baltimore Ravens, de 2002 a 2008. Pro Bowl e segundo time All-Pro em 2006." },
      ],
      after: [
      { type: "p", text: "Na câmera: já tinha começado naquela primeira temporada nos Jets, no Barking with Bart com Eric Allen. A Wikipedia registra trabalho posterior como analista da NFL na CBS, inclusive The NFL Today a partir de 2014, e como coapresentador da ESPN Radio em Nova York. O perfil dos Jets de 2025 também o coloca como analista de estúdio no Jets Post Game Live da SNY. Essa bancada não é este programa. O infobox da Wikipedia e a tabela de jogos não batem nos totais, então esses números ficam fora desta página. O Pro Football Reference guarda a linha." },
      ],
    },
    willie: {
      before: [
      { type: "p", text: "Antes dos Jets, Willie: Nasceu em 9 de abril de 1983, no Bronx. Cardinal Hayes High School. Hofstra. Pittsburgh o draftou na quarta rodada de 2006, escolha 131. Steelers de 2006 a 2012, no time campeão do Super Bowl XLIII. A Wikipedia lista 100 jogos e 100 titularidades. A linha de contagem está no Pro Football Reference." },
      ],
      after: [
      { type: "p", text: "O perfil dos Jets de 2024 o coloca como analista de pré-jogo e pós-jogo do clube na SportsNet New York. Esse trabalho não é este programa. A Wikipedia o coloca como analista do First Things First: OT na FS1. As bios não apontam a mesma bancada, então as duas ficam na página e nenhuma vira o único cargo." },
      ],
    },
  },
};
