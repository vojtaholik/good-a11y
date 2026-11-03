CREATE TABLE `messages` (
	`email` text NOT NULL,
	`id` text PRIMARY KEY,
	`message` text NOT NULL,
	`name` text,
	`received_at` integer NOT NULL,
	`url` text
);
--> statement-breakpoint
CREATE INDEX `messages_received_idx` ON `messages` (`received_at`,`id`);