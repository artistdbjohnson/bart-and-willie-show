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
      { type: "p", text: "February 27, 2009. Bart Scott signed with the Jets on a six-year deal and played linebacker through 2012. The contract put him back with Rex Ryan, his defensive coach in Baltimore." },
      {
        type: "quote",
        text: "That was my sole decision to sign with the Jets. No way I would have come to the Jets if Rex wasn't here. I would have stayed in Baltimore.",
        by: "Bart Scott, Jets profile, October 23, 2025",
      },
      { type: "p", text: "That same profile: four straight 100-tackle seasons before he arrived, then a fifth. The 2009 Jets defense finished first in the NFL in total defense, a first for the franchise. In his first two seasons the club won 20 of 32 regular-season games and reached the AFC Championship Game in 2009 and again in 2010. Four seasons as a Jet. Released February 19, 2013. The profile says he left the game in 2013 after a total reconstruction of a big toe." },
    ],
    willie: [
      { type: "p", text: "March 15, 2013. Willie Colon signed a one-year Jets deal after seven seasons in Pittsburgh and a Super Bowl XLIII ring. On March 19, 2014, the Jets brought him back for one year at $2 million. He played 2013, 2014, and 2015. Hofstra Athletics says he started 38 games in those three seasons and retired in 2016." },
      {
        type: "quote",
        text: "I was really a free agent for like 20 minutes. I got a call from Rex and he was like, ‘Hey, man, we know you're a New Yorker. It's time to come home.’",
        by: "Willie Colon, on the call from Rex Ryan, Jets profile, June 13, 2024",
      },
      { type: "p", text: "The Jets profile: a 2013 start of three wins in five games, a Week 6 home game against Pittsburgh, and Ryan out after a 4–12 season in 2014. In 2015, his third year in New York, a knee injury in Week 8 against Oakland put him on injured reserve 10 days later." },
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
      { type: "p", text: "Before the Jets, Bart: Bartholomew Edward Scott was born August 18, 1980, in Detroit. Southeastern High School. Southern Illinois, where he later finished an economics degree. Undrafted in 2002. Linebacker for the Baltimore Ravens, 2002 through 2008. Pro Bowl and second-team All-Pro in 2006." },
      ],
      after: [
      { type: "p", text: "On camera: he had already started that first Jets season, in Barking with Bart with Eric Allen. Wikipedia records later work as an NFL analyst for CBS, including The NFL Today from 2014, and as a co-host on ESPN Radio in New York. The Jets’ 2025 profile also has him as a studio analyst on SNY’s Jets Post Game Live. That desk is not this show. The Wikipedia infobox and its game table don’t agree on the counting totals, so those numbers stay off this page. Pro Football Reference has the line." },
      ],
    },
    willie: {
      before: [
      { type: "p", text: "Before the Jets, Willie: Born April 9, 1983, in the Bronx. Cardinal Hayes High School. Hofstra. Pittsburgh drafted him in the fourth round of 2006, 131st overall. Steelers from 2006 through 2012, including the Super Bowl XLIII championship team. Wikipedia lists 100 games played and 100 starts. The counting line is on Pro Football Reference." },
      ],
      after: [
      { type: "p", text: "The Jets’ 2024 profile has him as the club’s pregame and postgame analyst on SportsNet New York. That job is not this show. Wikipedia has him as an analyst on First Things First: OT on FS1. The bios don’t name the same desk, so both stay on the page and neither gets called his only job." },
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
