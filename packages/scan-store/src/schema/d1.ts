import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const Scans = sqliteTable(
  "scans",
  {
    failure: text("failure"),
    id: text("id").primaryKey().notNull(),
    reportJson: text("report_json"),
    requestedAt: integer("requested_at").notNull(),
    settledAt: integer("settled_at"),
    slug: text("slug").notNull(),
    stage: text("stage").notNull(),
    url: text("url").notNull(),
  },
  (table) => [
    index("scans_slug_recent_idx").on(table.slug, table.requestedAt, table.id),
    index("scans_requested_idx").on(table.requestedAt),
    check(
      "scans_stage_check",
      sql`${table.stage} IN ('queued', 'scanning', 'published', 'failed')`
    ),
    check(
      "scans_settled_check",
      sql`(${table.stage} IN ('published', 'failed')) = (${table.settledAt} IS NOT NULL)`
    ),
    check(
      "scans_report_check",
      sql`(${table.stage} = 'published') = (${table.reportJson} IS NOT NULL)`
    ),
    check(
      "scans_failure_check",
      sql`(${table.stage} = 'failed') = (${table.failure} IS NOT NULL)`
    ),
  ]
);

export const BrowserBudget = sqliteTable(
  "browser_budget",
  {
    day: text("day").primaryKey().notNull(),
    reservedSeconds: integer("reserved_seconds").notNull(),
  },
  (table) => [
    check("browser_budget_seconds_check", sql`${table.reservedSeconds} >= 0`),
  ]
);
