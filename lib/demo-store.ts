import type { Choice, QuestionResult } from "@/lib/types";

const demoQuestion = {
  id: "demo-today",
  questionDate: new Date().toISOString().slice(0, 10),
  prompt: "Would you rather have unlimited free flights or unlimited free food?",
  optionA: "Free flights",
  optionB: "Free food"
};

const demoVotes = new Map<string, Choice>();

export function getDemoToday(visitorId?: string): QuestionResult {
  return {
    ...demoQuestion,
    optionAVotes: 428 + [...demoVotes.values()].filter((choice) => choice === "a").length,
    optionBVotes: 572 + [...demoVotes.values()].filter((choice) => choice === "b").length,
    userVote: visitorId ? demoVotes.get(visitorId) ?? null : null,
    demoMode: true
  };
}

export function voteDemo(visitorId: string, choice: Choice): QuestionResult {
  demoVotes.set(visitorId, choice);
  return getDemoToday(visitorId);
}

export function getDemoArchive(): QuestionResult[] {
  return [
    getDemoToday(),
    {
      id: "demo-2",
      questionDate: "2026-05-08",
      prompt: "Would you rather be able to pause time or rewind time?",
      optionA: "Pause time",
      optionB: "Rewind time",
      optionAVotes: 613,
      optionBVotes: 387,
      userVote: null,
      demoMode: true
    },
    {
      id: "demo-3",
      questionDate: "2026-05-07",
      prompt: "Would you rather never have to sleep or never have to eat?",
      optionA: "Never sleep",
      optionB: "Never eat",
      optionAVotes: 742,
      optionBVotes: 258,
      userVote: null,
      demoMode: true
    }
  ];
}
