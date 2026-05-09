export type Choice = "a" | "b";

export type QuestionResult = {
  id: string;
  questionDate: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionAVotes: number;
  optionBVotes: number;
  userVote: Choice | null;
  demoMode: boolean;
};
