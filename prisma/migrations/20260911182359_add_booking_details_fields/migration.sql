/*
  Warnings:

  - Added the required column `hotelId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookedFor" AS ENUM ('SELF', 'GUEST');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('NID', 'PASSPORT', 'BIRTH_CERTIFICATE', 'DRIVING_LICENSE');

-- CreateEnum
CREATE TYPE "VisitPurpose" AS ENUM ('BUSINESS', 'LEISURE', 'MEDICAL', 'OFFICIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "bookedFor" TEXT NOT NULL DEFAULT 'SELF',
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "guestAddress" TEXT,
ADD COLUMN     "guestEmail" TEXT,
ADD COLUMN     "guestIdNumber" TEXT,
ADD COLUMN     "guestIdType" TEXT,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "guestPhone" TEXT,
ADD COLUMN     "guestPurpose" TEXT,
ADD COLUMN     "hotelId" TEXT NOT NULL,
ADD COLUMN     "roomsCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "specialRequests" TEXT;

-- CreateIndex
CREATE INDEX "bookings_hotelId_idx" ON "bookings"("hotelId");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
