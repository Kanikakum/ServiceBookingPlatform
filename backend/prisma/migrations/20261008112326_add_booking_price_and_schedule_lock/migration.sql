/*
  Warnings:

  - Added the required column `totalPrice` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `totalPrice` DECIMAL(10, 2) NOT NULL;

-- CreateTable
CREATE TABLE `provider_schedule_locks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `providerId` INTEGER NOT NULL,
    `bookingDate` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `provider_schedule_locks_providerId_bookingDate_key`(`providerId`, `bookingDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `bookings_customerId_createdAt_idx` ON `bookings`(`customerId`, `createdAt`);

-- CreateIndex
CREATE INDEX `bookings_providerId_createdAt_idx` ON `bookings`(`providerId`, `createdAt`);

-- CreateIndex
CREATE INDEX `bookings_status_idx` ON `bookings`(`status`);

-- AddForeignKey
ALTER TABLE `provider_schedule_locks` ADD CONSTRAINT `provider_schedule_locks_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
