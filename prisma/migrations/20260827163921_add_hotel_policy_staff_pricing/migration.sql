-- CreateEnum
CREATE TYPE "SubRole" AS ENUM ('MANAGER', 'FRONT_DESK', 'HOUSEKEEPING');

-- CreateEnum
CREATE TYPE "HousekeepingStatus" AS ENUM ('CLEAN', 'DIRTY', 'IN_PROGRESS', 'OOS');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('SEASONAL', 'WEEKEND', 'LENGTH_OF_STAY');

-- CreateTable
CREATE TABLE "hotel_policies" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "cancellationPolicy" TEXT,
    "petPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_staff" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subRole" "SubRole" NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "type" "PricingType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "modifier" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_housekeeping" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "HousekeepingStatus" NOT NULL DEFAULT 'DIRTY',
    "assignedStaffId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_housekeeping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_policies_hotelId_key" ON "hotel_policies"("hotelId");

-- CreateIndex
CREATE INDEX "hotel_policies_hotelId_idx" ON "hotel_policies"("hotelId");

-- CreateIndex
CREATE INDEX "hotel_staff_hotelId_idx" ON "hotel_staff"("hotelId");

-- CreateIndex
CREATE INDEX "hotel_staff_userId_idx" ON "hotel_staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_staff_hotelId_userId_key" ON "hotel_staff"("hotelId", "userId");

-- CreateIndex
CREATE INDEX "pricing_rules_hotelId_idx" ON "pricing_rules"("hotelId");

-- CreateIndex
CREATE INDEX "pricing_rules_roomTypeId_idx" ON "pricing_rules"("roomTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "room_housekeeping_roomId_key" ON "room_housekeeping"("roomId");

-- CreateIndex
CREATE INDEX "room_housekeeping_status_idx" ON "room_housekeeping"("status");

-- CreateIndex
CREATE INDEX "room_housekeeping_assignedStaffId_idx" ON "room_housekeeping"("assignedStaffId");

-- AddForeignKey
ALTER TABLE "hotel_policies" ADD CONSTRAINT "hotel_policies_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_staff" ADD CONSTRAINT "hotel_staff_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_staff" ADD CONSTRAINT "hotel_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_housekeeping" ADD CONSTRAINT "room_housekeeping_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_housekeeping" ADD CONSTRAINT "room_housekeeping_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "hotel_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
