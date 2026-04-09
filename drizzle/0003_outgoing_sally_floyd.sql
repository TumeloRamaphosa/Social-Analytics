CREATE TABLE `knowledgeDocs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`source` varchar(256) DEFAULT 'manual',
	`docType` enum('research','transcript','report','notes','strategy','client') NOT NULL DEFAULT 'notes',
	`content` text NOT NULL,
	`tags` json,
	`chunkCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeDocs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ragIndex` MODIFY COLUMN `analysisId` int;--> statement-breakpoint
ALTER TABLE `ragIndex` MODIFY COLUMN `domain` varchar(512);