CREATE TABLE `tokenUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`service` varchar(64) NOT NULL,
	`operation` varchar(128) NOT NULL,
	`inputTokens` int DEFAULT 0,
	`outputTokens` int DEFAULT 0,
	`totalTokens` int DEFAULT 0,
	`costUsd` float DEFAULT 0,
	`model` varchar(128),
	`prompt` text,
	`response` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenUsage_id` PRIMARY KEY(`id`)
);
