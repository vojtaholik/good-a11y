CREATE TABLE `judge_budget` (
	`day` text PRIMARY KEY,
	`reserved_tokens` integer NOT NULL,
	CONSTRAINT "judge_budget_tokens_check" CHECK("reserved_tokens" >= 0)
);
