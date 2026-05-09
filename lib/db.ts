import postgres from "postgres";

declare global {
  var humanityVotedSql: ReturnType<typeof postgres> | undefined;
}

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export function getSql() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!globalThis.humanityVotedSql) {
    globalThis.humanityVotedSql = postgres(process.env.DATABASE_URL, {
      max: 3,
      ssl: "require"
    });
  }

  return globalThis.humanityVotedSql;
}
