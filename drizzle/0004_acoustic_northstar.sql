ALTER TABLE `integrations` MODIFY COLUMN `type` enum('shopify','google_ads','facebook','instagram','whatsapp','google_drive','higgsfield') NOT NULL;--> statement-breakpoint
ALTER TABLE `integrations` ADD `higgsfieldApiKey` text;--> statement-breakpoint
ALTER TABLE `integrations` ADD `higgsfieldUsername` varchar(256);