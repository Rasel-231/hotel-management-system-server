/*
  Warnings:

  - The `status` column on the `hotels` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "HotelStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED', 'APPROVED');

-- AlterEnum
ALTER TYPE "PricingType" ADD VALUE 'EARLY_BIRD';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "guests" INTEGER,
ADD COLUMN     "noShow" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT DEFAULT 'ONLINE';

-- AlterTable
ALTER TABLE "hotel_policies" ADD COLUMN     "freeCancellationHours" INTEGER;

-- AlterTable
ALTER TABLE "hotels" ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "starRating" INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "HotelStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT';

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "basePrice" DOUBLE PRECISION,
ADD COLUMN     "bedConfig" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "hotel_images" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hotel_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hotel_images_hotelId_idx" ON "hotel_images"("hotelId");

-- CreateIndex
CREATE INDEX "hotels_status_idx" ON "hotels"("status");

-- CreateIndex
CREATE INDEX "hotels_status_location_idx" ON "hotels"("status", "location");

-- AddForeignKey
ALTER TABLE "hotel_images" ADD CONSTRAINT "hotel_images_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
