CREATE TABLE `browser_budget` (
	`day` text PRIMARY KEY,
	`reserved_seconds` integer NOT NULL,
	CONSTRAINT "browser_budget_seconds_check" CHECK("reserved_seconds" >= 0)
);
