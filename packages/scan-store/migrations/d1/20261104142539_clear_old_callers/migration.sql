CREATE INDEX `scans_caller_kept_idx` ON `scans` (`requested_at`) WHERE "scans"."caller" <> '';--> statement-breakpoint
UPDATE `scans` SET `caller` = '' WHERE `caller` <> '' AND `requested_at` <= CAST(strftime('%s', 'now') AS INTEGER) * 1000 - 86400000;
