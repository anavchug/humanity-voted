import Link from "next/link";
import { getArchive } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const questions = await getArchive();

  return (
    <main className="archive-shell">
      <nav className="topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>Split</span>
        </Link>
        <Link className="nav-pill" href="/">
          Today
        </Link>
      </nav>

      <section className="archive-hero">
        <p className="eyebrow">Archive</p>
        <h1>Past questions, preserved for later arguments.</h1>
      </section>

      <section className="archive-list" aria-label="Question archive">
        {questions.map((question) => {
          const total = question.optionAVotes + question.optionBVotes;
          const aPercent =
            total === 0 ? 50 : Math.round((question.optionAVotes / total) * 100);

          return (
            <article className="archive-item" key={question.id}>
              <div>
                <time>{new Date(`${question.questionDate}T00:00:00`).toLocaleDateString()}</time>
                <h2>{question.prompt}</h2>
              </div>
              <div className="mini-result" aria-label={`${aPercent}% chose ${question.optionA}`}>
                <span style={{ width: `${aPercent}%` }} />
              </div>
              <p>
                {aPercent}% {question.optionA} · {100 - aPercent}% {question.optionB}
              </p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
