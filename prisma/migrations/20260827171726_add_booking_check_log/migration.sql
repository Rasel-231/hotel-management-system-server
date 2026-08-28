-- CreateTable
CREATE TABLE "booking_check_logs" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "handledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_check_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_check_logs_bookingId_idx" ON "booking_check_logs"("bookingId");

-- CreateIndex
CREATE INDEX "booking_check_logs_handledBy_idx" ON "booking_check_logs"("handledBy");

-- AddForeignKey
ALTER TABLE "booking_check_logs" ADD CONSTRAINT "booking_check_logs_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_check_logs" ADD CONSTRAINT "booking_check_logs_handledBy_fkey" FOREIGN KEY ("handledBy") REFERENCES "hotel_staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
