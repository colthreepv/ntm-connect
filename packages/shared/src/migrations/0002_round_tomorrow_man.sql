CREATE TABLE `ping_stats` (
	`sale_point_id` text NOT NULL,
	`timestamp` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`latency` integer,
	`is_responsive` integer NOT NULL,
	`ip_address` text,
	`error_message` text,
	FOREIGN KEY (`sale_point_id`) REFERENCES `sale_point_credentials`(`id`) ON UPDATE no action ON DELETE no action
);
