# AgriRentX — Project Handover Document

**Last updated:** 2026-08-24
**Repo:** https://github.com/chopdadarshan7/agrirentx

This document is written for a developer/team picking up this project fresh. It
covers the tech stack, the architecture, everything that has been built and
verified working, and what still needs attention before this goes further.

---

## 1. What is AgriRentX

A farm equipment rental marketplace. Farmers browse and book equipment
(tractors, harvesters, etc.) from rentalers (equipment owners). Rentalers
list equipment, manage bookings, and get paid. Admins moderate the platform
(approve equipment/rentalers, handle disputes, broadcast notifications).

Three user-facing roles: **Farmer**, **Rentaler**, **Admin**. A single user
account can be both a farmer and an approved rentaler and switch between
dashboards.

---

## 2. Tech Stack

### Frontend (`/src`)
- **TanStack Start** (React 19) — file-based routing via TanStack Router
  (`src/routes/*.tsx`, route tree auto-generated into `routeTree.gen.ts`)
- **TanStack Query** for all server state (no Redux/Zustand for server data)
- **React Hook Form + Zod** for all forms/validation (`src/lib/validation/`)
- **shadcn/ui** components on top of Radix primitives (`src/components/ui/`)
- **Tailwind CSS v4** (CSS custom properties for theming, see `styles.css`)
- **Recharts** for admin dashboard charts
- Dev server: `http://localhost:8080`

### Backend (`/agrirentx-backend`)
- **Express 5 + Mongoose 9** (MongoDB Atlas)
- **JWT** auth (access + refresh tokens), `bcryptjs` for password hashing
- **Joi** and **express-validator** for request validation (used in
  different controllers — not fully unified, see §6)
- **Multer** for file uploads (profile photos, KYC docs, equipment images)
- **Razorpay** for real payment processing (test mode keys currently)
- **Socket.IO** for real-time notifications
- **Winston** for logging
- **Helmet** for security headers (CORP explicitly set to `cross-origin` so
  the frontend, on a different port, can load uploaded images)
- API base: `http://localhost:8000/api`
- Dev server watch: `nodemon`

### Data
MongoDB Atlas cluster. 2dsphere geospatial index on `Equipment.location` for
"near me" search (`GET /equipments/nearby`).

---

## 3. How to run it

```bash
# Backend
cd agrirentx-backend
npm install
cp .env.example .env   # then fill in real values — see §7, Security
npm run dev             # -> http://localhost:8000

# Frontend (separate terminal)
npm install
npm run dev              # -> http://localhost:8080
```

Health check: `GET http://localhost:8000/api/health`

---

## 4. Features implemented (verified working)

### Auth & Profile
- Register/login (JWT access + refresh), role-aware redirect after login
- Farmer → Rentaler upgrade flow with KYC (bank details, documents) —
  admin approves/rejects
- Editable profile (name, phone, address, city, state, pincode) with avatar
  upload
- Delivery address on the booking page auto-fills from the user's saved
  profile address (still editable), with a "Detect my location" button
  (browser geolocation → OpenStreetMap Nominatim reverse-geocode) as an
  alternative to typing it

### Equipment
- CRUD for rentalers (create/edit/delete listings), category-based, image
  upload
- Public browse page (`/equipment`) — search (bigger search bar), category
  filter, state/price filter, **"Near me"** toggle (10km radius geospatial
  query, disables the state/price filters while active since they don't
  combine server-side)
- Equipment detail page with reviews and availability info
- Rentaler "block dates" — mark specific date ranges unavailable
  (`agrirentx-backend/routes/availabilityRoutes.js`), shown read-only on the
  public detail page

### Booking lifecycle
- Create booking → past-date and end-before-start validation, delivery
  address + contact phone required if delivery requested
- Payment via Razorpay (real gateway, test keys)
- **EqTrack** — OTP-based physical handoff confirmation:
  - Rentaler generates a delivery OTP → sent to the farmer only (SMS +
    in-app notification) → rentaler must get the OTP from the farmer in
    person to confirm delivery (`logistics_status: awaiting_delivery →
    delivered`)
  - Same pattern in reverse for the return leg (`delivered → returned`)
  - Raw OTPs are stripped from every API response the rentaler can see —
    only the farmer's view includes them
  - Rentaler-side page: `/rentaler/eqtrack`
- On booking completion, equipment status correctly resets to `available`
  (this was broken before this session — equipment used to stay `rented`
  forever after one booking)
- Reviews: farmer can leave a review on equipment after the booking is
  returned/completed

### Notifications
- In-app notification panel (bell icon, per-user)
- SMS via **MSG91** (falls back to a console-log stub if
  `MSG91_AUTH_KEY`/`MSG91_OTP_TEMPLATE_ID` env vars aren't set — see §7)
- Admin **broadcast** — send a notification to All / Farmers / Rentalers
  (`/admin/broadcast`)

### Admin
- Dashboard with real analytics charts (bookings by status, equipment
  approval mix, user composition) — snapshot-based, not time-series
- Full payment/transaction detail view (nested booking → equipment →
  farmer/rentaler info)
- User, rentaler, equipment, booking, review moderation
- Broadcast notifications (see above)

### Public site translation
- Language switcher in the public header (English / Hindi / Marathi) using
  the Google Website Translator widget
- **Scoped to public pages only** (home, equipment browse/detail, login,
  register) — deliberately excluded from dashboards and the booking/payment
  flow. Reason: Google Translate mutates the DOM directly, which can
  collide with React's own re-renders during client-side navigation,
  producing an occasional recoverable UI glitch. This was tested live with
  a real browser (not just reasoned about) before being scoped down. See
  §6 for the residual risk.

---

## 5. Project structure quick reference

```
agrirentx-backend/
  controllers/     one file per resource (auth, booking, equipment, payment, admin, ...)
  models/          Mongoose schemas (user, booking, equipment, payment, review, notification, availability, wishlist, category)
  routes/          Express routers, mounted in server.js
  services/        business logic called by controllers (adminService, notificationService, paymentService, smsService, reviewService)
  validators/      Joi/express-validator schemas
  middleware/       authMiddleware (JWT), uploadMiddleware (multer), roleMiddleware
  uploads/         user-uploaded files (gitignored except .gitkeep — do not rely on this for real storage, see §6)

src/
  routes/          file-based pages (farmer.*, rentaler.*, admin.*, public pages)
  components/      shared UI (SiteHeader, DashboardShell, EquipmentForm, EquipmentCard, StatusBadge, ui/*)
  lib/api/         one file per resource, thin fetch wrappers around API_URL
  lib/validation/  Zod schemas matching backend validators
  hooks/queries/   TanStack Query hooks (use-bookings, use-auth, use-admin, use-availability, ...)
  types/models.ts  shared TS types mirroring backend schemas
```

---

## 6. Known issues / things the next team should know

1. **Google Translate + React navigation glitch (low severity, accepted
   risk).** Confirmed via live testing: navigating between translated public
   pages can occasionally throw a recoverable DOM error
   (`NotFoundError: removeChild`) because Google's widget rewrites the DOM
   outside React's control. Current mitigation: translation is off on
   dashboards and the booking flow, and the `googtrans` cookie is reset the
   moment a user enters any authenticated route. If this needs to be fully
   eliminated, the real fix is replacing the widget-based approach with a
   proper i18n library (e.g. `react-i18next`) and real translated strings —
   that's a larger effort, not attempted here.

2. **MSG91 SMS is not fully provisioned.** The integration code is in place
   (`agrirentx-backend/services/smsService.js`), but MSG91 requires a
   DLT-approved SMS template ID (an India telecom regulatory requirement)
   that only the account owner can register with MSG91/the telecom
   authority. Until `MSG91_AUTH_KEY` and `MSG91_OTP_TEMPLATE_ID` are set in
   `.env`, OTPs fall back to being logged to the server console instead of
   actually texted — EqTrack still works end-to-end in this mode, just
   without a real SMS being sent.

3. **File uploads are local disk, not object storage.** `uploads/` is a
   plain folder on the server's filesystem, served statically. Fine for a
   single-instance dev/demo deployment; will not survive a redeploy or
   scale past one instance. Move to S3/Cloudinary/etc. before any real
   production deployment.

4. **Validation is split between Joi and express-validator** across
   different controllers (inherited from before this session, not fully
   unified). Not a bug, just inconsistent — worth standardizing on one if
   doing a larger refactor.

5. **Admin dashboard charts are snapshot-based, not historical.** They show
   current totals (bookings by status, equipment mix, user composition),
   not trends over time. Adding real time-series charts would need new
   backend aggregation endpoints.

6. **A payment-collection feature was explicitly declined during this
   project's development**: an earlier request asked for a UI that collects
   a user's real bank account details and claims money will be
   auto-debited, without wiring it to any real payment rail. That was not
   built, on the grounds that it would function as a fake payment
   collection flow regardless of the demo context. Razorpay remains the
   only real payment path. If a bank-transfer/UPI-autopay feature is
   wanted, it needs a real payment/banking API behind it (e.g. Razorpay's
   own UPI Autopay / eNACH products), not a bare form.

---

## 7. Security — read before deploying or handing off credentials

**`agrirentx-backend/.env` was committed to this repo's git history in an
earlier commit** (before this session), containing a real MongoDB Atlas
password, JWT secrets, Razorpay test keys, and a Gmail SMTP app password.
It has since been removed from tracking and `.env` is now gitignored going
forward, but **anyone with access to the git history can still see the old
values**. Before this project goes anywhere beyond the current private repo:

- Rotate the MongoDB Atlas database user password
- Regenerate `JWT_SECRET` / `JWT_REFRESH_SECRET`
- Regenerate Razorpay keys if/when moving off test mode
- Revoke and regenerate the Gmail app password used for SMTP

None of these are exploitable as long as the repo stays private and the old
`.env` values are rotated before anyone untrusted gets access — but don't
assume the current `.env.example` placeholders mean the real secrets were
never exposed.

---

## 8. Suggested next steps for a new dev team

- Rotate the credentials in §7 first, before anything else
- Provision MSG91 (or swap to another SMS provider) for real OTP delivery
- Move file uploads off local disk to object storage before any real deploy
- Decide whether to keep or replace the Google Translate widget (§6, item 1)
- Consider unifying Joi vs express-validator if doing broader backend work
