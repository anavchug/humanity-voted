import { getSql } from "@/lib/db";
import { getDemoArchive, getDemoToday, voteDemo } from "@/lib/demo-store";
import type { Choice, QuestionResult } from "@/lib/types";

type QuestionRow = {
  id: string;
  question_date: string;
  prompt: string;
  option_a: string;
  option_b: string;
  option_a_votes: number;
  option_b_votes: number;
  user_vote: Choice | null;
};

function mapQuestion(row: QuestionRow, demoMode = false): QuestionResult {
  return {
    id: row.id,
    questionDate: row.question_date,
    prompt: row.prompt,
    optionA: row.option_a,
    optionB: row.option_b,
    optionAVotes: Number(row.option_a_votes),
    optionBVotes: Number(row.option_b_votes),
    userVote: row.user_vote,
    demoMode
  };
}

export async function getTodayQuestion(visitorId?: string): Promise<QuestionResult> {
  const sql = getSql();

  if (!sql) {
    return getDemoToday(visitorId);
  }

  const rows = await sql<QuestionRow[]>`
    select
      q.id,
      q.question_date::text,
      q.prompt,
      q.option_a,
      q.option_b,
      count(v.id) filter (where v.choice = 'a')::int as option_a_votes,
      count(v.id) filter (where v.choice = 'b')::int as option_b_votes,
      max(v.choice) filter (where v.visitor_id = ${visitorId ?? ""}) as user_vote
    from questions q
    left join votes v on v.question_id = q.id
    where q.question_date <= current_date
    group by q.id
    order by q.question_date desc
    limit 1
  `;

  if (!rows[0]) {
    return getDemoToday(visitorId);
  }

  return mapQuestion(rows[0]);
}

export async function castVote(input: {
  questionId: string;
  choice: Choice;
  visitorId: string;
}): Promise<QuestionResult> {
  const sql = getSql();

  if (!sql) {
    return voteDemo(input.visitorId, input.choice);
  }

  await sql`
    insert into votes (question_id, visitor_id, choice)
    values (${input.questionId}, ${input.visitorId}, ${input.choice})
    on conflict (question_id, visitor_id)
    do update set choice = excluded.choice, created_at = now()
  `;

  return getTodayQuestion(input.visitorId);
}

export async function getArchive(): Promise<QuestionResult[]> {
  const sql = getSql();

  if (!sql) {
    return getDemoArchive();
  }

  const rows = await sql<QuestionRow[]>`
    select
      q.id,
      q.question_date::text,
      q.prompt,
      q.option_a,
      q.option_b,
      count(v.id) filter (where v.choice = 'a')::int as option_a_votes,
      count(v.id) filter (where v.choice = 'b')::int as option_b_votes,
      null::text as user_vote
    from questions q
    left join votes v on v.question_id = q.id
    where q.question_date <= current_date
    group by q.id
    order by q.question_date desc
    limit 30
  `;

  return rows.map((row) => mapQuestion(row));
}
