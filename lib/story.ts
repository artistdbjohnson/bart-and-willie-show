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

export const jetsStory: Record<
  Locale,
  { bart: Block[]; willie: Block[] }
> = {
  en: {
    bart: [
      {
        type: "p",
        text: "Bart Scott signed with the New York Jets on February 27, 2009, on a six-year contract, and played linebacker there through the 2012 season. The deal put him back with Rex Ryan, his defensive coach in Baltimore.",
      },
      {
        type: "quote",
        text: "That was my sole decision to sign with the Jets. No way I would have come to the Jets if Rex wasn't here. I would have stayed in Baltimore.",
        by: "Bart Scott, in the Jets’ profile, October 23, 2025",
      },
      {
        type: "p",
        text: "That Jets profile says he arrived before the 2009 season with four straight 100-tackle seasons, then stretched the streak to five, and that the 2009 defense ranked first in the NFL in total defense, a first for the franchise. In his first two seasons the team won 20 of 32 regular-season games and reached the AFC Championship Game in 2009 and again in 2010. He spent four seasons as a Jet. The club released him on February 19, 2013. The same profile says he left the game in 2013 after a total reconstruction of a big toe.",
      },
    ],
    willie: [
      {
        type: "p",
        text: "Willie Colon signed a one-year Jets contract on March 15, 2013, after seven seasons with the Pittsburgh Steelers and a Super Bowl XLIII championship. The Jets re-signed him to a one-year contract worth $2 million on March 19, 2014. He played the 2013, 2014, and 2015 seasons. Hofstra Athletics says he started 38 games in those three seasons and retired in 2016.",
      },
      {
        type: "quote",
        text: "I was really a free agent for like 20 minutes. I got a call from Rex and he was like, ‘Hey, man, we know you're a New Yorker. It's time to come home.’",
        by: "Willie Colon, recounting Rex Ryan, in the Jets’ profile, June 13, 2024",
      },
      {
        type: "p",
        text: "The Jets profile describes a 2013 start of three wins in five games, a Week 6 home game against Pittsburgh, and Ryan’s exit after a 4–12 season in 2014. In 2015, his third season in New York, a knee injury in Week 8 against Oakland put him on injured reserve 10 days later.",
      },
    ],
  },
  pt: {
    bart: [
      {
        type: "p",
        text: "Bart Scott assinou com o New York Jets em 27 de fevereiro de 2009, num contrato de seis anos, e jogou como linebacker até a temporada de 2012. O acordo o reencontrou com Rex Ryan, seu técnico de defesa em Baltimore.",
      },
      {
        type: "quote",
        text: "That was my sole decision to sign with the Jets. No way I would have come to the Jets if Rex wasn't here. I would have stayed in Baltimore.",
        by: "Bart Scott, no perfil dos Jets, 23 de outubro de 2025",
        translation:
          "Essa foi a única razão de eu assinar com os Jets. Eu não teria vindo para os Jets se o Rex não estivesse aqui. Eu teria ficado em Baltimore.",
      },
      {
        type: "p",
        text: "Esse perfil dos Jets diz que ele chegou antes da temporada de 2009 com quatro temporadas seguidas de 100 tackles, estendeu a sequência para cinco, e que a defesa de 2009 ficou em primeiro na NFL em defesa total, a primeira vez na história da franquia. Nas duas primeiras temporadas o time venceu 20 de 32 jogos da temporada regular e chegou ao jogo do campeonato da AFC em 2009 e de novo em 2010. Foram quatro temporadas como Jet. O clube o dispensou em 19 de fevereiro de 2013. O mesmo perfil diz que ele deixou o jogo em 2013 depois de uma reconstrução total de um dedão do pé.",
      },
    ],
    willie: [
      {
        type: "p",
        text: "Willie Colon assinou um contrato de um ano com os Jets em 15 de março de 2013, depois de sete temporadas no Pittsburgh Steelers e do título do Super Bowl XLIII. Os Jets o renovaram por um ano, no valor de US$ 2 milhões, em 19 de março de 2014. Ele jogou as temporadas de 2013, 2014 e 2015. O Hall da Fama do atletismo de Hofstra diz que ele foi titular em 38 jogos nessas três temporadas e se aposentou em 2016.",
      },
      {
        type: "quote",
        text: "I was really a free agent for like 20 minutes. I got a call from Rex and he was like, ‘Hey, man, we know you're a New Yorker. It's time to come home.’",
        by: "Willie Colon, sobre a ligação de Rex Ryan, no perfil dos Jets, 13 de junho de 2024",
        translation:
          "Eu fui agente livre por uns 20 minutos. Recebi uma ligação do Rex e ele disse: ‘Ei, cara, a gente sabe que você é nova-iorquino. Está na hora de voltar para casa.’",
      },
      {
        type: "p",
        text: "O perfil dos Jets descreve um começo de 2013 com três vitórias em cinco jogos, um jogo em casa contra Pittsburgh na semana 6, e a saída de Ryan depois de uma temporada de 4–12 em 2014. Em 2015, sua terceira temporada em Nova York, uma lesão no joelho na semana 8 contra Oakland o colocou na reserva de lesionados 10 dias depois.",
      },
    ],
  },
};

export const hostStory: Record<Locale, { bart: Block[]; willie: Block[] }> = {
  en: {
    bart: [
      {
        type: "p",
        text: "Bartholomew Edward Scott was born August 18, 1980, in Detroit. He played at Southeastern High School and at Southern Illinois, and he later finished an economics degree there. He went undrafted in 2002 and signed with the Baltimore Ravens, where he played linebacker from 2002 through 2008. In 2006 he made the Pro Bowl and was named second-team All-Pro.",
      },
      ...jetsStory.en.bart,
      {
        type: "p",
        text: "He had already started on camera during that first Jets season, in Barking with Bart with Eric Allen. Wikipedia records later work as an NFL analyst for CBS, including The NFL Today from 2014, and as a co-host on ESPN Radio in New York. The Jets’ 2025 profile also describes him as a studio analyst on SNY’s Jets Post Game Live. That is a different broadcast from this show. Career counting totals differ between the Wikipedia infobox and its game table, so they are not reprinted here. Pro Football Reference keeps the stat line.",
      },
    ],
    willie: [
      {
        type: "p",
        text: "Willie Colon was born April 9, 1983, in the Bronx. He played at Cardinal Hayes High School and at Hofstra. Pittsburgh drafted him in the fourth round of 2006, 131st overall. He played for the Steelers from 2006 through 2012, including the Super Bowl XLIII championship team. Wikipedia lists 100 games played and 100 starts. The counting line is on Pro Football Reference.",
      },
      ...jetsStory.en.willie,
      {
        type: "p",
        text: "The Jets’ 2024 profile describes him as the club’s pre- and post-game analyst on SportsNet New York, again a separate job from this podcast. His Wikipedia entry describes him as an analyst on First Things First: OT on FS1. The published bios do not all name the same desk, so both are linked rather than folded into one current title.",
      },
    ],
  },
  pt: {
    bart: [
      {
        type: "p",
        text: "Bartholomew Edward Scott nasceu em 18 de agosto de 1980, em Detroit. Jogou na Southeastern High School e em Southern Illinois, onde depois concluiu a graduação em economia. Não foi escolhido no draft de 2002 e assinou com o Baltimore Ravens, onde jogou como linebacker de 2002 a 2008. Em 2006 foi ao Pro Bowl e entrou no segundo time All-Pro.",
      },
      ...jetsStory.pt.bart,
      {
        type: "p",
        text: "Ele já tinha ido para a câmera naquela primeira temporada nos Jets, no Barking with Bart, com Eric Allen. A Wikipedia registra o trabalho posterior como analista da NFL na CBS, inclusive no The NFL Today a partir de 2014, e como coapresentador na ESPN Radio de Nova York. O perfil dos Jets de 2025 também o descreve como analista de estúdio do Jets Post Game Live da SNY. Essa é uma transmissão diferente deste programa. Os totais de carreira divergem entre a ficha da Wikipedia e a tabela de jogos, então não são repetidos aqui. O Pro Football Reference guarda a linha de estatísticas.",
      },
    ],
    willie: [
      {
        type: "p",
        text: "Willie Colon nasceu em 9 de abril de 1983, no Bronx. Jogou na Cardinal Hayes High School e em Hofstra. Pittsburgh o escolheu na quarta rodada de 2006, o 131º no geral. Jogou nos Steelers de 2006 a 2012, inclusive no time campeão do Super Bowl XLIII. A Wikipedia lista 100 jogos e 100 titularidades. A linha de números está no Pro Football Reference.",
      },
      ...jetsStory.pt.willie,
      {
        type: "p",
        text: "O perfil dos Jets de 2024 o descreve como analista de pré e pós-jogo do clube na SportsNet New York, de novo um trabalho separado deste podcast. A entrada da Wikipedia o descreve como analista do First Things First: OT na FS1. As biografias publicadas não apontam todas para a mesma mesa, então as duas ficam linkadas em vez de virar um único cargo atual.",
      },
    ],
  },
};
