-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Convert TEXT columns to native Postgres enums without dropping existing data.
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus" USING ("status"::text::"BookingStatus");
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "bookings" ALTER COLUMN "bookedFor" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "bookedFor" TYPE "BookedFor" USING ("bookedFor"::text::"BookedFor");
ALTER TABLE "bookings" ALTER COLUMN "bookedFor" SET DEFAULT 'SELF';

ALTER TABLE "bookings" ALTER COLUMN "guestIdType" TYPE "IdType" USING ("guestIdType"::text::"IdType");

ALTER TABLE "bookings" ALTER COLUMN "guestPurpose" TYPE "VisitPurpose" USING ("guestPurpose"::text::"VisitPurpose");

-- CreateIndex
CREATE INDEX "bookings_status_expiresAt_idx" ON "bookings"("status", "expiresAt");