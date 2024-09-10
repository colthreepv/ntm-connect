CREATE TABLE `seed_tracker` (
	`id` text PRIMARY KEY NOT NULL,
	`run_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
