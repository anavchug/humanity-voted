import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";

function loadEnvFiles() {
  const fileValues = new Map<string, string>();

  for (const fileName of [".env", ".env.local"]) {
    const filePath = resolve(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

      if (!match || match[0].trim().startsWith("#")) {
        continue;
      }

      const [, key, rawValue] = match;
      const value = rawValue.trim().replace(/^(['"])(.*)\1$/, "$2");
      fileValues.set(key, value);
    }
  }

  for (const [key, value] of fileValues) {
    process.env[key] ??= value;
  }
}

function validateDatabaseUrl(databaseUrl: string) {
  try {
    new URL(databaseUrl);
  } catch {
    throw new Error(
      [
        "DATABASE_URL is not a valid URL.",
        "",
        "Check D:\\humanity-voted\\.env for these common Supabase connection string issues:",
        "- Keep the value on one line.",
        "- Wrap the whole value in double quotes.",
        "- Replace [YOUR-PASSWORD] or PASSWORD with your actual database password.",
        "- URL-encode special characters in the password. For example, @ becomes %40 and # becomes %23.",
        "",
        "Example:",
        'DATABASE_URL="postgresql://postgres.PROJECT_REF:my%40password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"'
      ].join("\n")
    );
  }
}

async function main() {
  loadEnvFiles();

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }

  validateDatabaseUrl(databaseUrl);

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: "require"
  });

  try {
    await sql`
      create extension if not exists pgcrypto;
    `;

    await sql`
      create table if not exists questions (
        id uuid primary key default gen_random_uuid(),
        question_date date not null unique,
        prompt text not null,
        option_a text not null,
        option_b text not null,
        created_at timestamptz not null default now()
      );
    `;

    await sql`
      create table if not exists votes (
        id bigserial primary key,
        question_id uuid not null references questions(id) on delete cascade,
        visitor_id text not null,
        choice text not null check (choice in ('a', 'b')),
        created_at timestamptz not null default now(),
        unique (question_id, visitor_id)
      );
    `;

    await sql`
      create index if not exists votes_question_choice_idx on votes (question_id, choice);
    `;

    await sql`
      insert into questions (question_date, prompt, option_a, option_b)
      values
        (current_date, 'Would you rather have unlimited free flights or unlimited free food?', 'Free flights', 'Free food'),
        (current_date + interval '1 day', 'Would you rather know when you die or how you die?', 'When you die', 'How you die'),
        (current_date + interval '2 days', 'Would you rather be able to pause time or rewind time?', 'Pause time', 'Rewind time'),
        (current_date + interval '3 days', 'Would you rather never have to sleep or never have to eat?', 'Never sleep', 'Never eat'),
        (current_date + interval '4 days', 'Would you rather be famous but broke or rich but unknown?', 'Famous but broke', 'Rich but unknown'),
        (current_date + interval '5 days', 'Would you rather lose your phone or your wallet?', 'Lose phone', 'Lose wallet'),
        (current_date + interval '6 days', 'Would you rather have your search history leaked or your camera roll leaked?', 'Search history', 'Camera roll'),
        (current_date + interval '7 days', 'Would you rather relive your best day or erase your worst day?', 'Relive best day', 'Erase worst day'),
        (current_date + interval '8 days', 'Would you rather always be 10 minutes late or 20 minutes early?', '10 minutes late', '20 minutes early'),
        (current_date + interval '9 days', 'Would you rather go back 10 years with your current knowledge or receive $1 million today?', 'Go back 10 years', '$1 million today')
      on conflict (question_date) do update set
        prompt = excluded.prompt,
        option_a = excluded.option_a,
        option_b = excluded.option_b;
    `;

    console.log("Humanity Voted database seeded.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
