CREATE TABLE `care_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`output_ml` integer NOT NULL,
	`consistency` text NOT NULL,
	`hydration_ml` integer NOT NULL,
	`skin_status` text NOT NULL,
	`pain` integer NOT NULL,
	`leak` integer NOT NULL,
	`pouch_changed` integer NOT NULL,
	`food` text NOT NULL,
	`symptoms` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `care_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`due_date` text NOT NULL,
	`completed` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`product_code` text NOT NULL,
	`quantity` integer NOT NULL,
	`reorder_at` integer NOT NULL,
	`unit` text NOT NULL
);
