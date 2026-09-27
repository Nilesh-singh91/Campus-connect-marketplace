# CampusConnect Marketplace

> **A Secure, Scalable, College-Only Peer-to-Peer Marketplace for Engineering & University Campuses**  
> *Developed as a B.Tech Computer Science & Engineering Major Capstone Project.*

---

## 1. Project Overview & Problem Statement

### The Problem
Every semester, thousands of college students purchase expensive engineering textbooks, lab drafters, scientific calculators, mattresses, study tables, bicycles, and lab equipment. At the end of the semester or upon graduation, these usable academic resources either end up discarded or sit idle in hostel rooms. Meanwhile, junior students are forced to buy new items at steep retail prices.

Standard commercial classified sites (e.g. OLX, Facebook Marketplace) fail campus requirements due to:
1. **Safety & Trust Deficit**: Anonymous sellers and rampant advance payment fraud.
2. **Geographical Friction**: Shipping costs and logistical delays exceed the value of the items.
3. **No Barter / Exchange Mechanism**: Students cannot trade their 2nd-year textbooks directly for 3rd-year textbooks without liquid currency.
4. **Lack of Institutional Moderation**: Prohibited materials or non-academic spam can proliferate.

### The Solution: CampusConnect Marketplace
**CampusConnect** solves this by establishing a **closed, verified campus network**. Students register strictly with verified college email domains (`@college.edu`, `@lit.ac.in`). All transactions and trades happen peer-to-peer on campus (library foyer, student cafeteria, department hostel), eliminating shipping fees and fraud. The platform features an integrated **Item Barter / Exchange Engine**, **In-App Real-time Messaging**, **Role-Based Access Control (Student, Moderator, Admin)**, and a **Student Council Moderation Workflow**.

---

## 2. Key Features

### For Students
* **Verified Campus Registration**: Validates institutional email domains (`.edu`, `.ac.in`) with automated OTP verification.
* **Student Identity Profile**: Displays department branch, year of study, and verified badge to establish peer trust.
* **Marketplace Listings**: Post items for **Sale**, **Exchange**, or **Both**. Upload up to 6 high-res images with instant client preview.
* **Dynamic Search & Filtering**: Debounced keyword search, category filter, condition picker (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`), and price range filters.
* **Item Barter / Trade Engine**: Propose direct swaps (e.g., *“My Casio 991EX for your CLRS Algorithm book + ₹100 cash difference”*).
* **Direct In-App Messaging**: Secure buyer-seller communication with read status and notification triggers.
* **Wishlist & Favorites**: Save items for later reference with optimistic updates.
* **Safety Reporting**: Flag prohibited items or suspicious users directly to council moderators.

### For Campus Moderators
* **Moderation Queue**: Review reported listings and users with reporter testimony.
* **Disciplinary Actions**: Warn users, suspend accounts, remove illicit listings, or dismiss false reports.
* **Audit Trail**: Every action logged with timestamp, moderator identity, and internal notes.

### For Platform Administrators
* **Analytics Console**: Metrics for active listings, completed exchanges, registered students, and open disputes.
* **Account Management**: Update student roles (`STUDENT`, `MODERATOR`, `ADMIN`) or lift account suspensions.
* **Catalog Oversight**: Monitor listing distribution across campus categories.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | **Next.js 15+ (App Router)**, **TypeScript (Strict Mode)**, **Tailwind CSS**, **Lucide Icons** |
| **Backend** | Next.js Server Components, Server Actions, REST Route Handlers (`/api/*`), Layered Service Architecture |
| **Database & ORM** | **PostgreSQL**, **Prisma ORM (v6)**, Relational Foreign Keys, Cascade Triggers & Indexes |
| **Authentication** | Secure **bcryptjs** (10 salt rounds), **jose** JWT token with HTTP-only SameSite cookies, RBAC Guards |
| **Storage Abstraction**| `StorageProvider` pattern (LocalStorageProvider for local dev, switchable to AWS S3 / Cloudinary) |
| **Validation** | **Zod v3** (Runtime schema validation on all API endpoints and forms) |
| **Testing** | **Vitest**, Automated Unit and Integration Test Suites |
| **Containerization & CI** | **Docker Multi-Stage Build**, **Docker Compose**, **GitHub Actions CI** |

---

## 4. System Architecture

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|   Next.js 15+ App Router, React Server Components (RSC), Tailwind CSS, shadcn/ui      |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                  API & ACTIONS LAYER                                  |
|   Server Actions & REST Route Handlers (/api/*), Zod Request Validation, Middleware  |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                              AUTHORIZATION & SECURITY GUARD                           |
|   Session Guard, RBAC (STUDENT, MODERATOR, ADMIN), College Domain Whitelist Guard    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                     SERVICE LAYER                                     |
|   ListingService, AuthService, ChatService, ExchangeService, ModerationService        |
|   StorageProvider (Local Disk / S3 / Cloudinary Abstraction)                          |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                REPOSITORY / DATA LAYER                                |
|   Prisma ORM, Query Optimization, Selective Fetching, Full-Text Search, Migrations    |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                  POSTGRESQL DATABASE                                  |
|   14 Relational Entities, Foreign Keys, Unique Indexes, Multi-Column Constraints      |
+-------------------------------------------+-------------------------------------------+
```

---

## 5. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    COLLEGE_DOMAIN ||--o{ USER : "verifies"
    USER ||--o| STUDENT_PROFILE : "has"
    USER ||--o{ LISTING : "owns"
    USER ||--o{ FAVORITE : "saves"
    USER ||--o{ CONVERSATION_MEMBER : "participates in"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ EXCHANGE_REQUEST : "initiates/receives"
    USER ||--o{ REPORT : "submits"
    USER ||--o{ MODERATION_ACTION : "executes"
    USER ||--o{ NOTIFICATION : "receives"

    CATEGORY ||--o{ LISTING : "categorizes"
    LISTING ||--o{ LISTING_IMAGE : "contains"
    LISTING ||--o{ FAVORITE : "receives"
    LISTING ||--o{ CONVERSATION : "referenced in"
    LISTING ||--o{ EXCHANGE_REQUEST : "target/offered"
    LISTING ||--o{ REPORT : "reported"

    CONVERSATION ||--o{ CONVERSATION_MEMBER : "has"
    CONVERSATION ||--o{ MESSAGE : "contains"
    REPORT ||--o{ MODERATION_ACTION : "resolved by"
```

---

## 6. Pre-Configured Demo Accounts (1-Click Evaluation)

For university examiners, professors, and peer evaluators, the login screen includes 1-click credentials:

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `aarav@college.edu` | `Campus@1234` | Browse, post items, exchange proposals, in-app messaging, favorites. |
| **Moderator** | `moderator@college.edu` | `Campus@1234` | Full access + `/moderator` queue, warn users, remove listings, audit notes. |
| **Administrator** | `admin@college.edu` | `Campus@1234` | System root access + `/admin` analytics, user suspension, role promotion. |

---

## 7. Local Installation & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher (Tested on Node v24)
* **npm**: v9.0.0 or higher
* **PostgreSQL**: Local PostgreSQL instance, cloud PostgreSQL (Neon / Supabase), or Docker

### Step 1: Clone or Navigate to Directory
```bash
cd "C:\Users\niles\Desktop\campus-connect-marketplace"
```

### Step 2: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL database. Example:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusconnect?schema=public"
JWT_SECRET="campusconnect-super-secure-jwt-secret-key-change-in-production-min32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
NEXT_PUBLIC_UPLOAD_DIR="/uploads/listings"
```

### Step 4: Run Database Migrations & Seed Sample Data
```bash
# Push schema to database
npm run db:push

# Seed demo categories, college domains, and sample listings
npm run db:seed
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Automated Testing & Verification

Run the test suite using Vitest:
```bash
# Run all unit and integration tests
npm test

# Run tests in interactive watch mode
npm run test:watch
```

Verify strict TypeScript compilation:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

---

## 9. Running with Docker Compose

To spin up both PostgreSQL and the Next.js production container simultaneously:
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:3000`.

---

## 10. Team Roles & Academic Project Scope

* **Team Size**: 2–3 B.Tech CSE Undergraduates
* **Academic Duration**: 5–6 Months
* **Core Modules Distributed**:
  * *Member 1*: Frontend Architecture, Responsive UI (Next.js 15, Tailwind, shadcn/ui components), and Image Upload Engine.
  * *Member 2*: Authentication, Security Model, RBAC, Database Schema (Prisma ORM, PostgreSQL), and REST APIs.
  * *Member 3*: Chat Messaging, Item Exchange State Machine, Moderation Queue, and Automated Testing.

### Future Enhancements (Phase 2 Roadmap)
1. **Push Notifications**: WebPush & Service Worker notifications for real-time barter offers.
2. **Campus Geofencing**: Verification of on-campus physical handovers via GPS radius check.
3. **Semester Syllabus Integration**: Auto-tagging textbooks directly to university subject codes.
