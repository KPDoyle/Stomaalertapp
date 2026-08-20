CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`output` integer NOT NULL,
	`skin` integer NOT NULL,
	`comfort` integer NOT NULL,
	`mood` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `diary_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`file_key` text,
	`file_name` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`sender` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`owner` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`email` text NOT NULL,
	`stoma_type` text NOT NULL,
	`duration` text NOT NULL,
	`date_created` text NOT NULL,
	`nurse` text NOT NULL,
	`supplier` text NOT NULL,
	`products` text NOT NULL,
	`learning` text NOT NULL,
	`home_subtitle` text NOT NULL,
	`checkin_heading` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `supply_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`supplier` text NOT NULL,
	`product` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
