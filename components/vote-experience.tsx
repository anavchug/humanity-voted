"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Choice = "a" | "b";

type TodayQuestion = {
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

const loadingQuestion: TodayQuestion = {
  id: "loading",
  questionDate: new Date().toISOString().slice(0, 10),
  prompt: "Would you rather pause time or rewind time?",
  optionA: "Pause time",
  optionB: "Rewind time",
  optionAVotes: 0,
  optionBVotes: 0,
  userVote: null,
  demoMode: true
};

export function VoteExperience() {
  const [question, setQuestion] = useState<TodayQuestion>(loadingQuestion);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState<Choice | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadQuestion() {
      const response = await fetch("/api/today", { cache: "no-store" });
      const data = (await response.json()) as TodayQuestion;

      if (isActive) {
        setQuestion(data);
        setIsLoading(false);
      }
    }

    loadQuestion().catch(() => setIsLoading(false));

    return () => {
      isActive = false;
    };
  }, []);

  const totalVotes = question.optionAVotes + question.optionBVotes;
  const optionAPercent = totalVotes === 0 ? 50 : Math.round((question.optionAVotes / totalVotes) * 100);
  const optionBPercent = totalVotes === 0 ? 50 : 100 - optionAPercent;
  const hasVoted = question.userVote !== null;

  const displayDate = useMemo(() => {
    return new Date(`${question.questionDate}T00:00:00`).toLocaleDateString("en", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
  }, [question.questionDate]);

  async function vote(choice: Choice) {
    setIsVoting(choice);

    const response = await fetch("/api/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        questionId: question.id,
        choice
      })
    });

    const data = (await response.json()) as TodayQuestion;
    setQuestion(data);
    setIsVoting(null);
  }

  async function share() {
    const shareText = `Today's Humanity Voted: ${question.prompt}`;

    if (navigator.share) {
      await navigator.share({
        title: "Humanity Voted",
        text: shareText,
        url: window.location.href
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="shell">
      <nav className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Humanity Voted</span>
        </Link>
        <div className="nav-actions">
          <Link className="nav-pill" href="/archive">
            Past Questions
          </Link>
          <button className="nav-pill" type="button" onClick={share}>
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </nav>

      <section className="stage" aria-busy={isLoading}>
        <div className="question-panel">
          <div className="question-meta">
            <span>Today</span>
            <span>{displayDate}</span>
          </div>
          <p className="eyebrow">Would you rather</p>
          <h1>{question.prompt.replace(/^Would you rather\s*/i, "")}</h1>
        </div>

        <div className="choice-grid" aria-label="Vote choices">
          <ChoiceButton
            choice="a"
            label={question.optionA}
            percent={optionAPercent}
            votes={question.optionAVotes}
            hasVoted={hasVoted}
            isSelected={question.userVote === "a"}
            isVoting={isVoting === "a"}
            onClick={() => vote("a")}
          />
          <ChoiceButton
            choice="b"
            label={question.optionB}
            percent={optionBPercent}
            votes={question.optionBVotes}
            hasVoted={hasVoted}
            isSelected={question.userVote === "b"}
            isVoting={isVoting === "b"}
            onClick={() => vote("b")}
          />
        </div>

        <div className={`reveal ${hasVoted ? "is-open" : ""}`}>
          <div>
            <span className="result-label">Global vote</span>
            <strong>{totalVotes.toLocaleString()} votes</strong>
          </div>
          <div className="result-bar" aria-label={`${optionAPercent}% to ${optionBPercent}%`}>
            <span className="bar-a" style={{ width: `${optionAPercent}%` }} />
            <span className="bar-b" style={{ width: `${optionBPercent}%` }} />
          </div>
        </div>

        <aside className={`tomorrow-card ${hasVoted ? "is-open" : ""}`} aria-live="polite">
          <span>Next question drops tomorrow</span>
          <strong>Come back and see where humanity lands.</strong>
        </aside>

        {question.demoMode ? (
          <p className="demo-note">
            Preview mode is using sample votes. Connect Supabase to make results live.
          </p>
        ) : null}
      </section>
    </main>
  );
}

type ChoiceButtonProps = {
  choice: Choice;
  label: string;
  percent: number;
  votes: number;
  hasVoted: boolean;
  isSelected: boolean;
  isVoting: boolean;
  onClick: () => void;
};

function ChoiceButton({
  choice,
  label,
  percent,
  votes,
  hasVoted,
  isSelected,
  isVoting,
  onClick
}: ChoiceButtonProps) {
  return (
    <button
      className={`choice choice-${choice} ${hasVoted ? "has-results" : ""} ${isSelected ? "is-selected" : ""}`}
      type="button"
      onClick={onClick}
      disabled={isVoting}
    >
      <span className="choice-fill" style={{ transform: `scaleX(${hasVoted ? percent / 100 : 0})` }} />
      <span className="choice-content">
        <span className="choice-kicker">{choice === "a" ? "Option A" : "Option B"}</span>
        <span className="choice-label">{label}</span>
      </span>
      <span className="choice-result">
        <strong>{hasVoted ? `${percent}%` : isVoting ? "..." : "Pick"}</strong>
        <span>{hasVoted ? `${votes.toLocaleString()} votes` : "tap to reveal"}</span>
      </span>
    </button>
  );
}
