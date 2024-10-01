CREATE TABLE `subscribed_users` (
	`user_id` integer NOT NULL,
	`username` text,
	`subscribed_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribed_users_user_id_unique` ON `subscribed_users` (`user_id`);