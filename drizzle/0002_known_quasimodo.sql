CREATE TABLE `adReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`reportType` enum('weekly','monthly','custom','spend_optimisation') NOT NULL DEFAULT 'weekly',
	`platform` enum('facebook','instagram','google_ads','shopify','all') NOT NULL DEFAULT 'all',
	`dateFrom` timestamp NOT NULL,
	`dateTo` timestamp NOT NULL,
	`totalSpend` float,
	`totalRevenue` float,
	`roas` float,
	`impressions` int,
	`clicks` int,
	`conversions` int,
	`reportData` json,
	`aiInsights` text,
	`recommendations` json,
	`reportMarkdown` text,
	`reportPdfUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brandVoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`tone` varchar(256),
	`audience` text,
	`keyMessages` json,
	`avoidWords` json,
	`examplePosts` json,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brandVoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentCalendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`postId` int,
	`title` varchar(512) NOT NULL,
	`description` text,
	`platform` enum('facebook','instagram','whatsapp','all') NOT NULL DEFAULT 'all',
	`contentType` enum('product','educational','promotional','ugc','behind_scenes','testimonial') NOT NULL DEFAULT 'product',
	`scheduledDate` timestamp NOT NULL,
	`status` enum('planned','draft','ready','published') NOT NULL DEFAULT 'planned',
	`color` varchar(16) DEFAULT '#2563eb',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentCalendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512),
	`caption` text,
	`hashtags` text,
	`imageUrl` varchar(2048),
	`imagePrompt` text,
	`platform` enum('facebook','instagram','whatsapp','all') NOT NULL DEFAULT 'all',
	`status` enum('draft','scheduled','published','failed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`engagementRate` float,
	`aiGenerated` boolean DEFAULT false,
	`aiModel` varchar(64),
	`contentBrief` text,
	`brandVoice` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `googleAdsCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`campaignName` varchar(512),
	`status` varchar(32),
	`budget` float,
	`impressions` int,
	`clicks` int,
	`cost` float,
	`conversions` float,
	`ctr` float,
	`cpc` float,
	`roas` float,
	`date` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `googleAdsCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('shopify','google_ads','facebook','instagram','whatsapp','google_drive') NOT NULL,
	`status` enum('active','expired','error','disconnected') NOT NULL DEFAULT 'active',
	`shopifyDomain` varchar(256),
	`shopifyAccessToken` varchar(512),
	`googleAdsCustomerId` varchar(64),
	`googleRefreshToken` text,
	`googleAccessToken` text,
	`googleTokenExpiresAt` timestamp,
	`metaAccessToken` text,
	`metaPageId` varchar(64),
	`metaBusinessId` varchar(64),
	`metaAdAccountId` varchar(64),
	`metaInstagramId` varchar(64),
	`whatsappPhoneNumberId` varchar(64),
	`whatsappAccessToken` text,
	`googleDriveFolderId` varchar(128),
	`metadata` json,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopifyOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`shopifyOrderId` varchar(64) NOT NULL,
	`totalPrice` float,
	`currency` varchar(8),
	`financialStatus` varchar(64),
	`fulfillmentStatus` varchar(64),
	`customerId` varchar(64),
	`lineItems` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`shopifyCreatedAt` timestamp,
	CONSTRAINT `shopifyOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopifyProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`shopifyProductId` varchar(64) NOT NULL,
	`title` varchar(512),
	`description` text,
	`productType` varchar(256),
	`tags` json,
	`variants` json,
	`images` json,
	`status` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopifyProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaceMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member','viewer') NOT NULL DEFAULT 'member',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workspaceMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`plan` enum('starter','pro','agency') NOT NULL DEFAULT 'starter',
	`logoUrl` varchar(2048),
	`brandColor` varchar(16) DEFAULT '#2563eb',
	`isWhiteLabel` boolean DEFAULT false,
	`planExpiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspaces_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD `workspaceId` int;