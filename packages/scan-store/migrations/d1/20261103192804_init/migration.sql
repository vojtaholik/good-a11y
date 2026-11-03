CREATE TABLE `scans` (
	`failure` text,
	`id` text PRIMARY KEY,
	`report_json` text,
	`requested_at` integer NOT NULL,
	`settled_at` integer,
	`slug` text NOT NULL,
	`stage` text NOT NULL,
	`url` text NOT NULL,
	CONSTRAINT "scans_stage_check" CHECK("stage" IN ('queued', 'scanning', 'published', 'failed')),
	CONSTRAINT "scans_settled_check" CHECK(("stage" IN ('published', 'failed')) = ("settled_at" IS NOT NULL)),
	CONSTRAINT "scans_report_check" CHECK(("stage" = 'published') = ("report_json" IS NOT NULL)),
	CONSTRAINT "scans_failure_check" CHECK(("stage" = 'failed') = ("failure" IS NOT NULL))
);
--> statement-breakpoint
CREATE INDEX `scans_slug_recent_idx` ON `scans` (`slug`,`requested_at`,`id`);--> statement-breakpoint
CREATE INDEX `scans_requested_idx` ON `scans` (`requested_at`);