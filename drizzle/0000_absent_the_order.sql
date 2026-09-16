CREATE TABLE `journals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`media_url` text,
	`media_type` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journals_slug_unique` ON `journals` (`slug`);--> statement-breakpoint
CREATE TABLE `mods` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` text,
	`image_url` text,
	`file_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mods_slug_unique` ON `mods` (`slug`);--> statement-breakpoint
CREATE TABLE `servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`version` text,
	`edition` text,
	`address` text,
	`port` text,
	`image_url` text,
	`gallery` text,
	`owner_name` text,
	`contact` text,
	`payment_note` text,
	`status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `servers_slug_unique` ON `servers` (`slug`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
