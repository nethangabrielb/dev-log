export const keys = {
  auth: {
    profile: () => ["auth", "profile"] as const,
  },
  sessions: {
    all: (filters?: object) => ["sessions", filters ?? {}] as const,
    one: (id: string) => ["sessions", id] as const,
    stats: () => ["sessions", "stats"] as const,
    streaks: () => ["sessions", "streaks"] as const,
  },
  dsa: {
    all: (filters?: object) => ["dsa", filters ?? {}] as const,
    one: (id: string) => ["dsa", id] as const,
    stats: () => ["dsa", "stats"] as const,
  },
  projects: {
    all: () => ["projects"] as const,
    one: (id: string) => ["projects", id] as const,
    stats: (id: string) => ["projects", id, "stats"] as const,
  },
  articles: {
    all: (filters?: object) => ["articles", filters ?? {}] as const,
    stats: () => ["articles", "stats"] as const,
  },
  snippets: {
    all: (search?: string) => ["snippets", search ?? ""] as const,
  },
  dailyReports: {
    all: () => ["daily-reports"] as const,
    one: (date: string) => ["daily-reports", date] as const,
  },
};
