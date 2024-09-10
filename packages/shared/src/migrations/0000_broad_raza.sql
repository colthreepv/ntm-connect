CREATE TABLE `sale_point_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`storeId` text NOT NULL,
	`storeFullName` text NOT NULL,
	`deviceType` text NOT NULL,
	`publicIp` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`email` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
