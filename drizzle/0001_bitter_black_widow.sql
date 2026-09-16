CREATE TABLE `analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`path` text NOT NULL,
	`event` text NOT NULL,
	`device` text NOT NULL,
	`browser` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_rollup_unique` ON `analytics` (`day`,`path`,`event`,`device`,`browser`);