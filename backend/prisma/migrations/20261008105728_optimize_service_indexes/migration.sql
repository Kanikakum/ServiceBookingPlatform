-- DropIndex
DROP INDEX `services_isActive_idx` ON `services`;

-- DropIndex
DROP INDEX `services_price_idx` ON `services`;

-- CreateIndex
CREATE INDEX `services_isActive_categoryId_idx` ON `services`(`isActive`, `categoryId`);

-- CreateIndex
CREATE INDEX `services_isActive_price_idx` ON `services`(`isActive`, `price`);

-- CreateIndex
CREATE INDEX `services_isActive_createdAt_idx` ON `services`(`isActive`, `createdAt`);

-- CreateIndex
CREATE INDEX `services_providerId_createdAt_idx` ON `services`(`providerId`, `createdAt`);
