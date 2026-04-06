CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` varchar(2048) NOT NULL,
	`domain` varchar(512) NOT NULL,
	`companyName` varchar(512),
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`whoisData` json,
	`dnsRecords` json,
	`registrationDetails` json,
	`seoData` json,
	`performanceScore` int,
	`seoScore` int,
	`socialProfiles` json,
	`totalSocialFollowers` int,
	`techStack` json,
	`competitiveData` json,
	`aiSummary` text,
	`industryCategory` varchar(256),
	`reportMarkdown` text,
	`reportPdfUrl` varchar(2048),
	`googleDriveUrl` varchar(2048),
	`cachedAt` timestamp,
	`isCached` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analysisCache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domain` varchar(512) NOT NULL,
	`rawHtml` text,
	`headers` json,
	`technologies` json,
	`metaTags` json,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisCache_id` PRIMARY KEY(`id`),
	CONSTRAINT `analysisCache_domain_unique` UNIQUE(`domain`)
);
--> statement-breakpoint
CREATE TABLE `ragIndex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`domain` varchar(512) NOT NULL,
	`chunkType` varchar(64) NOT NULL,
	`content` text NOT NULL,
	`embedding` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ragIndex_id` PRIMARY KEY(`id`)
);
