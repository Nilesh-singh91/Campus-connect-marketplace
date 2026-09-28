<div align="center">

# 🎓 CampusConnect Marketplace
### *Secure, College-Only Peer-to-Peer Marketplace for Engineering & University Campuses*

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%26%20PostgreSQL-4479A1?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Vitest](https://img.shields.io/badge/Tests-37%2F37%20Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A production-grade, deployable B.Tech CSE Major Capstone Project built for university placements, engineering portfolio, and real-world campus trade.</b>
</p>

[Explore Catalog](http://localhost:3000/browse) • [Lost & Found](http://localhost:3000/lost-and-found) • [AI Valuation](http://localhost:3000/ai-price-estimator) • [Free Corner (₹0)](http://localhost:3000/browse?type=DONATION) • [Key Features](#-3-key-features) • [Architecture](#-6-system-architecture) • [Demo Logins](#-7-pre-configured-demo-accounts)

</div>

---

## 📌 1. Project Overview & Problem Statement

### ❌ The Campus Problem
Every semester, engineering and university students spend thousands of rupees on expensive textbooks, mini drafters, scientific calculators, mattresses, monitors, bicycles, and lab equipment. At the end of each semester or after graduation:
* Valuable academic resources sit idle in hostels or get discarded.
* Incoming junior students are forced to purchase brand-new equipment at full retail price.
* Generic commercial classifieds (**OLX, Facebook Marketplace**) fail because of **scams, anonymous sellers, non-verified identities, logistical delivery delays, and lack of barter/trade mechanisms**.

### ✅ The CampusConnect Solution
**CampusConnect** is a closed, trusted college commerce ecosystem engineered to facilitate secure student-to-student transactions directly inside college gates.

1. **Verified Student Identity**: Students register strictly using recognized college email domains (`@liet.in`, `@gniot.net.in`, `@glbitm.ac.in`, `@galgotiascollege.edu`, `@aktu.in`, `@college.edu`).
2. **Zero-Trust Campus Isolation**: While students can explore listings across partner campuses, direct transactions, negotiations, and messaging are strictly scoped to students of the same college to ensure safe in-person physical handovers.
3. **Item Barter & Trade Engine**: Enables peer item-for-item swaps with optional cash difference adjustments (e.g. *“My Casio fx-991EX calculator for your CLRS Algorithm book + ₹100”*).
4. **Institutional Moderation**: Dedicated Student Council and Faculty moderation queue with disciplinary action audit trails.

---

## 🚀 2. Newly Added Flagship Innovations

### 1. 🔍 Campus "Lost & Found" Tracker (खोया-पाया पोर्टल)
College students regularly misplace ID cards, scientific calculators, metro cards, and project files in libraries, canteens, and labs. Traditional notice boards are ignored, and broadcasting room locations on unmoderated groups leads to fraudulent claims.
CampusConnect implements a **3-Layer Secure Handshake Protocol**:
* **Custody Tracking**: Finder declares where the item is kept (*“With Finder (meet at Student Canteen)”* or *“Handed to Central Library Helpdesk”*).
* **Secret Identification Mark**: Finder creates a verification question (e.g., *“What sticker or marking is on the back battery lid?”*). Claimants submit confidential proof known only to the real owner.
* **4-Digit Physical Handshake OTP**: When the finder approves the proof, the system issues a 4-digit code. During in-person handover, the claimant presents the OTP; the finder enters it to formally close and archive the record as **RESOLVED**.

### 2. 🤖 AI Fair Price Suggester & Valuation Tool (AI प्राइस कैलकुलेटर)
Prevents unreasonable pricing and eliminates tedious campus bargaining.
* **Academic Depreciation Curve**: Factors in original MRP, wear condition (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`), semester age, and college exam cycle demand.
* **Fast-Sell Probability Score**: Calculates probability of clearance within 48 hours.
* **Junior Savings Benchmark**: Displays transparent percentage savings (40%–85% discount vs. retail bookshops).
* **1-Click Form Transfer**: Instantly auto-fills calculated pricing into the marketplace listing creation form.

### 3. 🎁 End-of-Semester "Free Giveaways / Donation Corner" (₹0 का सेक्शन)
Designed for graduating seniors and hostel pass-outs donating drafters, lab aprons, sheets, and books to juniors.
* Enforced **₹0 price validation** with distinctive emerald badges and dedicated filters.
* Promotes circular economy, peer sustainability, and zero campus waste.

### 4. 💡 "Skill & Academic Barter" (विद्या विनिमय / Service Swap)
Recognizes that peer support extends beyond physical items:
* Students can trade academic services (e.g., *“Python & Data Structures tutoring in exchange for Engineering Drawing sheets / AutoCAD assistance”*).
* Completely non-monetary, cashless category with specialized barter badges.

---

## ⚡ 3. Key Features

CampusConnect features built-in multi-tenant campus separation with automated domain verification for major colleges in the **Greater Noida Knowledge Park Cluster** and premier technical institutions:

```
                  +----------------------------------------------+
                  |         CAMPUSCONNECT MARKETPLACE HUB        |
                  +-----------------------+----------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
+-------v-------------------------+                       +-----------------v---------------+
|  GREATER NOIDA KNOWLEDGE PARK   |                       |    TECHNICAL & STATE UNIVERSITIES   |
|  * Lloyd Institute (LIET)       |                       |  * AKTU (Dr. A.P.J. Abdul Kalam) |
|  * GNIOT (Knowledge Park II)   |                       |  * National Institute of Tech   |
|  * GL Bajaj (GLBITM, KP-III)   |                       |  * Laxminarayan Tech (LIT)      |
|  * Galgotias College (GCET)     |                       |  * IIT Bombay (IITB)            |
|  * Sharda University            |                       |  * NIT Hamirpur (NITH)          |
|  * Bennett University           |                       |  * Metropolitan College         |
+---------------------------------+                       +---------------------------------+
```

---

## ⚡ 3. Key Features

### 🛍️ For Students (Buyers & Sellers)
* **Institutional Domain Authentication**: Automated verification with OTP flow and college identity parsing.
* **Student Verified Profiles**: Badges showing student branch, year of study, contact details, and verified college banner.
* **Flexible Listing Options**: Post items for **Sale Only**, **Exchange Only**, or **Both**.
* **Campus Restriction Scope (Safety Toggle)**: Sellers can explicitly choose:
  * 🔒 **Restricted to My Campus**: Exclusively visible and tradable with fellow campus peers for safe hostel/canteen handoff.
  * 🌐 **Multi-College Discovery**: Open to discovery across partner institutions in the Greater Noida / university network.
* **Smart Barter Engine**: Send structured exchange proposals with optional cash differences.
* **Direct In-App Messaging**: Real-time conversation threads between verified students linked to listing context.
* **Multi-Attribute Search & Filter**: Filter by category, college campus, campus scope, condition (`NEW`, `LIKE_NEW`, `GOOD`, `FAIR`), and price range.
* **High-Contrast Campus Theme**: Fully optimized light theme designed for crisp readability on mobile and desktop.

### 🛡️ For Campus Council Moderators
* **Flagged Content Queue**: Review items reported by students with reporter testimony.
* **Moderator Disciplinary Powers**: Dismiss false reports, warn students, suspend repeat offenders, or remove policy-violating listings.
* **Audit Trail**: Every disciplinary action is permanently logged with timestamps and moderator notes.

### 📊 For Platform Administrators
* **System Analytics Console**: Live dashboard tracking active listings, completed exchanges, registered students, and open disputes.
* **User Management**: Role upgrades (`STUDENT` ➔ `MODERATOR` ➔ `ADMIN`) and account reactivation.

---

## 🛠️ 4. Technology Stack

| Architecture Layer | Technology | Rationale & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.3 (App Router)** | Server Components (RSC), Turbopack engine, dynamic route handlers. |
| **Language** | **TypeScript (Strict Mode)** | 100% type-safe compilation (`npx tsc --noEmit`). |
| **Styling & Icons** | **Tailwind CSS v4 + Lucide** | High-contrast campus theme with accessible UI components. |
| **ORM & Database** | **Prisma ORM v6 + SQLite / PostgreSQL** | Dual-schema design: Zero-install local SQLite for evaluation, PostgreSQL ready for production. |
| **Authentication** | **bcryptjs + jose (JWT)** | HTTP-only, SameSite cookies with RBAC middleware protection. |
| **Validation** | **Zod v3** | End-to-end schema validation across forms, queries, and APIs. |
| **Testing** | **Vitest** | Automated unit tests covering business rules, state machines, and security rules. |

---

## 📐 5. System Architecture

### Multi-Campus Isolation & Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Student (e.g. Lloyd @liet.in)
    participant Web as Next.js Web App
    participant Auth as Auth & Domain Guard
    participant API as Listings / Exchange API
    participant DB as Database (Prisma ORM)

    Buyer->>Web: Browse /listings/:id
    Web->>API: GET /api/listings/:id
    API->>DB: Fetch listing with College Domain
    DB-->>API: Listing (campusOnly: true, college: LIET)
    API-->>Web: Render Listing Details + Safety Badges

    alt Buyer is from Same Campus (LIET)
        Buyer->>Web: Click "Message Seller" or "Propose Trade"
        Web->>API: POST /api/conversations or /api/exchanges
        API->>Auth: Verify Buyer & Seller College Domain Match
        Auth-->>API: Match Approved (Both @liet.in)
        API->>DB: Create Conversation / Exchange Record
        API-->>Web: 201 Created (Redirect to Chat / Exchange)
    else Buyer is from Different Campus (e.g. AKTU / GNIOT)
        Buyer->>Web: Attempt Interaction
        Web-->>Buyer: Show "Cross-Campus Restricted Item" (Buttons Disabled)
        Note over Web,Buyer: Physical exchange protected within campus gates!
    end
```

### Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    COLLEGE_DOMAIN ||--o{ USER : "verifies"
    USER ||--o| STUDENT_PROFILE : "has"
    USER ||--o{ LISTING : "owns"
    USER ||--o{ FAVORITE : "bookmarks"
    USER ||--o{ CONVERSATION_MEMBER : "participates"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ EXCHANGE_REQUEST : "proposes"
    USER ||--o{ REPORT : "submits"
    USER ||--o{ MODERATION_ACTION : "executes"
    USER ||--o{ NOTIFICATION : "receives"

    CATEGORY ||--o{ LISTING : "classifies"
    LISTING ||--o{ LISTING_IMAGE : "contains"
    LISTING ||--o{ FAVORITE : "favorited in"
    LISTING ||--o{ CONVERSATION : "topic of"
    LISTING ||--o{ EXCHANGE_REQUEST : "target/offered"
    LISTING ||--o{ REPORT : "target"
```

---

## 🔑 6. Pre-Configured Demo Accounts

For university examiners, recruiters, and evaluators, all demo accounts use the standard password:

> **Password for all accounts:** `Campus@1234`

| College Campus | Student Email | Branch & Year | Sample Products Seeded |
| :--- | :--- | :--- | :--- |
| **Lloyd Institute (LIET)** | `aman@liet.in` | CSE, 3rd Year | Dell Inspiron 15, Galvin OS Book, Mini Drafter, GATE Notes |
| **GNIOT Greater Noida** | `rahul@gniot.net.in` | Mechanical, 4th Year | HP 15s Core i5, AKTU Quantum Series, 24" Monitor, Cycle |
| **GL Bajaj (GLBITM)** | `karan@glbitm.ac.in` | CSE, 3rd Year | Lenovo IdeaPad Gaming 3, CLRS 4th Ed, fx-991CW Calculator |
| **Galgotias College (GCET)** | `ananya@galgotiascollege.edu` | ECE, 3rd Year | Apple MacBook Pro M1, Arduino Starter Kit, DSP Textbook |
| **Sharda University** | `tanya@sharda.ac.in` | Biotech, 2nd Year | Dell 2-in-1 Touchscreen Laptop, Lab Coat & Goggles |
| **Bennett University** | `arjun@bennett.edu.in` | CSE (AI/ML), 3rd Year | ASUS ROG Strix G15, O'Reilly ML Book, MX Master Mouse |
| **AKTU Campus** | `sneha@aktu.in` | IT, 2nd Year | HP Pavilion 14, Maths Quantum Series, Study Lamp |
| **National Institute of Tech** | `aarav@college.edu` | CSE, 3rd Year | ThinkPad T480, Tanenbaum Networks, Keychron K2 Keyboard |
| **Campus Moderator** | `moderator@college.edu` | Faculty / Council | Full moderation access at `/moderator` |
| **System Administrator** | `admin@college.edu` | Dean Student Affairs | Full platform analytics and role access at `/admin` |

---

## 🚀 7. Local Development Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Git** installed on your machine

### 1. Clone the Repository
```bash
git clone https://github.com/Nilesh-singh91/Campus-connect-marketplace.git
cd Campus-connect-marketplace
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (defaults to zero-install SQLite for instant evaluation):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="campusconnect-super-secure-jwt-secret-key-change-in-production-min32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
NEXT_PUBLIC_UPLOAD_DIR="/uploads/listings"
```

> **Note on PostgreSQL**: To use PostgreSQL for production, set `DATABASE_URL="postgresql://user:password@localhost:5432/campusconnect"` and use `prisma/schema.postgresql.prisma`.

### 4. Push Database Schema & Seed Demo Data
```bash
# Push schema into database
npx prisma db push

# Seed 65+ demo products across all Greater Noida and partner colleges
npx tsx prisma/seed.ts
```

### 5. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🧪 8. Automated Testing & Verification

Run the Vitest test suite covering campus isolation, IDOR guards, and business state machines:
```bash
# Run all automated tests
npm test

# Run tests in interactive watch mode
npm run test:watch
```

Verify strict TypeScript compilation:
```bash
npx tsc --noEmit
```

Build the production bundle:
```bash
npm run build
```

---

## 📁 9. Project Directory Structure

```
campus-connect-marketplace/
├── prisma/
│   ├── schema.prisma              # SQLite schema (zero-setup local development)
│   ├── schema.postgresql.prisma   # PostgreSQL enterprise production schema
│   ├── seed.ts                    # Seeds 65+ demo items across 12 colleges
│   └── dev.db                     # Local SQLite database
├── public/
│   └── uploads/listings/          # Uploaded product image storage
├── src/
│   ├── app/
│   │   ├── (auth)/                # Login, Register, Verify Email pages
│   │   ├── admin/                 # Platform administration & analytics
│   │   ├── api/                   # REST API routes (Auth, Listings, Exchanges, Chat)
│   │   ├── browse/                # Marketplace catalog with college & price filters
│   │   ├── conversations/         # Real-time buyer-seller messaging
│   │   ├── exchange-requests/     # Barter / trade proposals dashboard
│   │   ├── listings/              # Create, View, Edit listing pages
│   │   ├── moderator/             # Student Council report review console
│   │   ├── profile/               # Student public profile & listings
│   │   ├── globals.css            # High-contrast light theme design tokens
│   │   └── layout.tsx             # Root app layout with Navbar & Footer
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, UserMenu
│   │   ├── marketplace/           # ListingCard, FilterSidebar, SortSelect, ImageGallery
│   │   └── ui/                    # Reusable Button, Input, Modal, Badge components
│   ├── context/
│   │   └── AuthContext.tsx        # React Context for authenticated student session
│   ├── lib/
│   │   ├── auth.ts                # bcrypt password hashing & JWT token verification
│   │   ├── db.ts                  # Singleton Prisma Client instance
│   │   ├── utils.ts               # Price formatting (₹), timeAgo, date helpers
│   │   └── validations/           # Zod schemas (Auth, Listing, Interaction)
│   └── types/
│       └── enums.ts               # Role, ItemCondition, TransactionType, ListingStatus
├── tests/
│   └── unit/
│       ├── business-rules.test.ts # Campus isolation, IDOR, and domain validation tests
│       └── foundation.test.ts     # Password hashing & JWT token security tests
├── vitest.config.ts               # Vitest testing configuration
└── package.json                   # Project dependencies and npm scripts
```

---

## 🔒 10. Security & Engineering Best Practices

1. **In-Person Campus Handoff Isolation**: Unlike commercial apps where cross-region fraud is prevalent, CampusConnect requires both trading parties to belong to the same verified college campus, encouraging physical handoffs at campus canteens or libraries.
2. **IDOR (Insecure Direct Object Reference) Protection**: API endpoints verify that only the original item owner or authorized administrators/moderators can edit, delete, or modify listing status.
3. **HTTP-Only, SameSite JWT Cookies**: Auth tokens are stored in secure HTTP-only cookies, preventing token theft via XSS vulnerabilities.
4. **Input Sanitization & Zod Validation**: Every client payload is validated before reaching the database, preventing injection attacks.
5. **Atomic View & Counter Updates**: Views and stats are updated atomically using Prisma operators (`increment: 1`).

---

## 👨‍💻 11. Authors & Academic Credits

* **Nilesh Singh** & Project Team — B.Tech Computer Science & Engineering
* **Project Type**: Major Capstone Engineering Project
* **Supervised By**: Department of Computer Science & Engineering

---

## 📄 12. License

This project is licensed under the [MIT License](LICENSE) — free to use and adapt for academic and educational purposes.
