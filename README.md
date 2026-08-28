# My Premium Backend

A TypeScript + Express.js backend for a premium e-commerce platform with AI, email, payment, and file upload capabilities.

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js v4.18.2
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis (ioredis)
- **File Upload:** Cloudinary + Multer
- **Payment Gateway:** SSLCommerz
- **Email Service:** Nodemailer (Gmail SMTP)
- **AI Integration:** OpenRouter API (Llama 3)
- **Validation:** Zod
- **Authentication:** JWT + bcrypt

## Features

### Current
- **User Registration** with avatar upload, AI-generated welcome text, email notification, and instant payment initiation
- **AI Integration** — generates personalized welcome content via OpenRouter (Llama 3)
- **File Upload** — Cloudinary integration via Multer for avatar/image uploads
- **Email Service** — sends transactional emails via Nodemailer
- **Payment Gateway** — SSLCommerz integration for BDT payments
- **Redis Caching** — session management and caching layer
- **Global Error Handling** — centralized error handler with Zod validation support
- **Modular Architecture** — feature-based modules (routes → controllers → services)

### Planned
- Authentication & Authorization (JWT login/register with role-based access)
- Order management (CRUD + status tracking)
- Payment management & webhook handling
- Advanced filtering, searching, and pagination

## Project Structure

```
my-premium-backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server bootstrap
│   ├── app/
│   │   ├── modules/
│   │   │   └── user/             # User module
│   │   │       ├── user.constant.ts
│   │   │       ├── user.controller.ts
│   │   │       ├── user.interface.ts
│   │   │       ├── user.route.ts
│   │   │       ├── user.service.ts
│   │   │       └── user.validation.ts
│   │   ├── prisma/               # Prisma schema (multi-file)
│   │   │   ├── schema.prisma     # Generator & datasource
│   │   │   ├── user.prisma       # User model
│   │   │   ├── order.prisma      # Order model
│   │   │   └── payment.prisma    # Payment model
│   │   └── routes/
│   │       └── index.ts          # Route aggregator
│   ├── config/
│   │   └── index.ts              # Env config loader
│   ├── errors/
│   │   └── ApiError.ts           # Custom error class
│   ├── interfaces/
│   │   └── common.ts             # Shared interfaces
│   ├── middlewares/
│   │   ├── globalErrorHandler.ts # Error handler
│   │   └── validateRequest.ts    # Zod validation middleware
│   ├── shared/
│   │   ├── paginationHelper.ts   # Pagination utility
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── redis.ts              # Redis client
│   └── utils/
│       ├── aiHelper.ts           # OpenRouter AI integration
│       ├── catchAsync.ts         # Async error wrapper
│       ├── fileUploadHelper.ts   # Cloudinary + Multer setup
│       ├── paymentHelper.ts      # SSLCommerz integration
│       ├── sendEmailHelper.ts    # Nodemailer setup
│       └── sendResponse.ts       # Standardized response helper
├── prisma.config.ts              # Prisma config
├── package.json
├── tsconfig.json
└── .env
```

## Prerequisites

- Node.js >= 18
- PostgreSQL
- Redis
- Cloudinary account
- SSLCommerz merchant account
- OpenRouter API key
- Gmail account (for email)

## Environment Variables

Create a `.env` file in the root:

| Variable | Description |
|---|---|
| `NODE_ENV` | Environment (`development`, `production`) |
| `PORT` | Server port (default: `5000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT token expiry (e.g. `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `30d`) |
| `SALT_ROUND` | bcrypt salt rounds |
| `CLOUD_NAME` | Cloudinary cloud name |
| `API_KEY` | Cloudinary API key |
| `API_SECRET` | Cloudinary API secret |
| `Store_ID` | SSLCommerz Store ID |
| `Store_Password` | SSLCommerz Store password |
| `AI_API_KEY` | OpenRouter API key |
| `SUPPORT_EMAIL` | Gmail sender address |
| `APP_PASSWORD` | Gmail app password |
| `BASE_URL` | Backend base URL |
| `FRONTEND_URL` | Frontend URL |

## Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run prisma:generate

# 3. Push schema to database
npm run prisma:push

# 4. Start development server
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |
| `npm run lint` | Lint source files |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:migrate` | Run Prisma migrations |

## API Endpoints

### User
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/users/register-profile` | Register a new user (avatar upload, AI welcome, email, payment) |

## Database Models

- **User** — id, email, password, name, role (USER/ADMIN), avatar, status
- **Order** — id, user, amount, currency, transaction ID, customer info, status
- **Payment** — id, order, amount, currency, method, status, transaction ID, gateway URL
