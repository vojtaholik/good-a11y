ALTER TABLE `scans` ADD `caller` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `scans_site_caller_idx` ON `scans` (`slug`,`caller`,`requested_at`);