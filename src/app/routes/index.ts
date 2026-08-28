import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { HotelRoutes } from '../modules/hotel/hotel.route';
import { RoomRoutes } from '../modules/room/room.route';
import { BookingRoutes } from '../modules/booking/booking.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { HotelPolicyRoutes } from '../modules/hotelPolicy/hotelPolicy.route';
import { PricingRuleRoutes } from '../modules/pricingRule/pricingRule.route';
import { HotelStaffRoutes } from '../modules/hotelStaff/hotelStaff.route';
import { RoomHousekeepingRoutes } from '../modules/roomHousekeeping/roomHousekeeping.route';
import { BookingCheckLogRoutes } from '../modules/bookingCheckLog/bookingCheckLog.route';
import { UserRoutes } from '../modules/user/user.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { NotificationRoutes } from '../modules/notification/notification.route';
import { AIRoutes } from '../modules/ai/ai.route';
import { SearchRoutes } from '../modules/search/search.route';
import { ReportRoutes } from '../modules/report/report.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/hotels', route: HotelRoutes },
  { path: '/rooms', route: RoomRoutes },
  { path: '/bookings', route: BookingRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/hotel-policies', route: HotelPolicyRoutes },
  { path: '/pricing-rules', route: PricingRuleRoutes },
  { path: '/hotel-staff', route: HotelStaffRoutes },
  { path: '/room-housekeeping', route: RoomHousekeepingRoutes },
  { path: '/booking-check-logs', route: BookingCheckLogRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/ai', route: AIRoutes },
  { path: '/search', route: SearchRoutes },
  { path: '/reports', route: ReportRoutes },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
