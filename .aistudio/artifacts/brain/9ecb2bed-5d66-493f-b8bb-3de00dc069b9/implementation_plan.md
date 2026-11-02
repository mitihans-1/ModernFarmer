# FarmLink Ethiopia — Phase 1 (MVP) Implementation Plan

FarmLink Ethiopia is an accessible, offline-capable digital agricultural platform designed specifically for Ethiopian smallholders, agro-dealers, equipment providers, and commodity buyers. It eliminates exploitative middleman markups by connecting farmers directly to input suppliers and fair regional produce markets with real-time regional price transparency, vernacular language support, and trusted local payment flows.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned via clarification questions and will govern Phase 1:

- **Confirmed Decision 1: Database & Runtime**: Express.js backend with local Prisma SQLite and Haversine geo-distance math. This provides instant zero-friction relational data persistence in the applet environment, full migration support, and fast spatial filtering across Ethiopian administrative divisions (Region > Zone > Woreda > Kebele).
- **Confirmed Decision 2: 3D Visualization Integration**: Lightweight Three.js procedural 3D viewer for Ethiopian agricultural assets (e.g. Teff crop sheaf, organic Coffee cherry cluster, and heavy-duty tractor/equipment) using procedural geometries, studio PBR lighting, and a collapsible bottom dock that does not block mobile viewports.
- **Confirmed Decision 3: Default User Experience**: Top quick-role switch bar (Farmer, Input Supplier, Produce Buyer, Platform Admin) so evaluators and stakeholders can experience all user journeys instantly without manual re-login.
- **Confirmed Decision 4: Language & Localization**: First-class multilingual support from day one, defaulting to Amharic and Afaan Oromo with instantaneous toggle to English and Tigrinya, paired with audio/voice prompts and large tap targets for low-literacy users.
- **Confirmed Decision 5: Payment Workflows**: Full support for both digital mobile money (Telebirr, CBE Birr, Chapa simulation with escrow hold and delivery release) and Cash on Delivery (COD) with verification receipt codes.

---

## 1. Overview & Core Concept

### What It Does
Phase 1 delivers the operational agricultural marketplace:
1. **Vernacular Onboarding & Phone OTP Authentication**: Login via Ethiopian mobile numbers (`+251 9...` / `+251 7...`) with simulated SMS OTP verification and role profiles.
2. **Input Marketplace**: Agro-dealer catalog featuring essential inputs (Urea, DAP, NPS fertilizer, certified seeds, pesticides, PPE clothing, and farm tools) priced in ETB with stock levels, woreda location, and cooperative distribution markers.
3. **Produce & Livestock Listings**: Farmers list crops (Teff Magna, Red Teff, Wheat, Maize, Sidama Coffee, Onion) and livestock with quality grades, photos, quantities in quintals (Qtl) or kg, and asking prices.
4. **Official Regional Price Board**: Live daily market price benchmarks across key markets (Addis Ababa Merkato, Bahir Dar, Jimma, Hawassa, Mekelle, Adama) to protect farmers from predatory middlemen.
5. **Orders & Escrow Transaction Flow**: Order placement with payment choice (Telebirr, CBE Birr, Cash on Delivery), order status progression (`PENDING` -> `CONFIRMED` -> `ESCROW_HELD` -> `DELIVERED` -> `COMPLETED`), and buyer/seller confirmation codes.
6. **3D Crop & Equipment Inspector**: Lightweight Three.js procedural 3D asset visualizer showcasing crop varieties and farm tools with zero external 404 dependencies.

### Target Audience & Persona
- **Ato Bekele (Smallholder Farmer in East Shewa, Oromia)**: Uses a low-cost Android phone on 2G/3G network. Needs high-contrast UI, Amharic or Afaan Oromo text, audio readouts, large tap targets, and clear pricing benchmarks before selling teff.
- **W/ro Almaz (Licensed Agro-Dealer in Bahir Dar, Amhara)**: Sells certified seeds and NPS fertilizer, manages inventory and dispatches orders to local kebeles.
- **Dawit (Agricultural Produce Trader in Addis Ababa)**: Procures bulk coffee and grains directly from cooperatives and farmers with verifiable grades.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Role Switcher & Language Selection**:
   - Header bar allows instant switching between **Farmer**, **Supplier**, **Buyer**, and **Admin**.
   - Language selector buttons (`አማርኛ` | `Afaan Oromoo` | `ትግርኛ` | `English`) instantly swap all text and audio tooltips.
2. **Farmer Input Purchase Flow**:
   - Farmer browses categorized inputs (Fertilizer, Seed, Chemicals, Tools).
   - Filter by Woreda/Zone or distance slider.
   - Click item -> view specs, supplier details, cooperative quota status -> Tap "Order Now" -> Select delivery/pickup and payment method (Telebirr / CBE Birr / Cash) -> Confirm.
3. **Farmer Produce Listing & Price Check Flow**:
   - Farmer opens "Market Prices" tab to view today's average buying rate for White Teff in their Zone.
   - Farmer taps "List My Harvest" -> enters crop name, quantity (quintals), grade (Grade 1 / 2), woreda, and asking price in ETB -> Listing goes live immediately.
4. **Buyer Offer & Order Flow**:
   - Buyer inspects farmer's teff listing -> places order or counter-offer -> funds escrow via Telebirr simulation -> Farmer confirms delivery -> Funds released.
5. **Interactive 3D Crop/Equipment Inspector**:
   - User taps 3D view on any seed or equipment listing -> interactive 3D model opens with 360-degree rotation, zoom, part inspection labels, and collapsible bottom dock.

### Visual Identity & Theme
- **Aesthetic Direction**: Authentic Ethiopian agrarian modernism. Earthy, purposeful, sunlight-readable, and utilitarian.
- **Color Palette**:
  - Dominant Canvas: Clean warm stone (`#F8F9FA` / `#F4EFEA`)
  - Primary Brand Green: Ethiopian Highland Evergreen (`#1E5631` / `#2D6A4F`)
  - Warm Earth Tone: Teff Harvest Ochre (`#DDA15E` / `#BC6C25`)
  - Deep Surface / Dark Text: Deep Abyssinian Charcoal (`#1B1E1B`)
  - Semantic Status: Telebirr Blue (`#007ACC`), CBE Purple-Gold (`#800020`), Success Forest (`#2D6A4F`)
- **Typography**:
  - Clean multilingual typography supporting Ethiopic Ge'ez script alongside Latin (`Noto Sans Ethiopic`, `Plus Jakarta Sans`, system fallback).
  - High typographic hierarchy, large tap targets ($\ge 48\text{px}$), high contrast ratio ($\ge 5:1$).
- **Anti-Slop Discipline**:
  - Zero decorative pulsing dots, zero generic purple gradients, zero nested cards-in-cards.
  - Clean unboxed metadata with subtle dot separators (`Teff · Grade 1 · Ada'a Woreda · 5,200 ETB/Qtl`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Stack Express + SQLite Architecture**:
  - *Chosen*: Express backend serving REST API routes (`/api/*`) connected via Prisma ORM to a local SQLite database (`file:./prisma/dev.db`), Vite React frontend on port 3000.
  - *Why*: Provides relational schemas, zero remote connection latency or credentials requirement in AI Studio, and guarantees 100% reliable local test execution and mock-free state.
- **Decision 2: Multilingual Ge'ez & Latin String Dictionary**:
  - *Chosen*: Structured in-memory i18n dictionary system with instant reactive translation hook (`useTranslation()`) supporting Amharic (`am`), Afaan Oromo (`om`), Tigrinya (`ti`), and English (`en`).
  - *Why*: Zero third-party bundle bloat, zero 3G loading delay, instant text swaps with fallback resilience.
- **Decision 3: Offline-Resilient PWA & Local Caching**:
  - *Chosen*: Web App Manifest + Service Worker registration + local state caching for cached listings and price board viewing when network drops.
  - *Why*: Critical for Ethiopian rural connectivity where network connectivity fluctuates.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   FARMLINK ETHIOPIA — CLIENT (REACT)                   │
├────────────────────────────────────────────────────────────────────────┤
│  [Top Bar Contract: Brand · Language Switcher · Active Role Switcher]   │
├────────────────────────────────────────────────────────────────────────┤
│  [Views: Inputs Catalog | Produce Market | Price Board | Orders | 3D] │
│  ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ Farmer Action Center  │ │ Agro-Dealer Hub   │ │ Buyer Market Hub  │ │
│  └───────────────────────┘ └───────────────────┘ └───────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Three.js 3D Agricultural Inspector (Procedural PBR + Bottom Dock) │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │ Escrow Payment Modal (Telebirr · CBE Birr · Cash on Delivery)     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │ JSON REST API
┌────────────────────────────────────▼───────────────────────────────────┐
│                 EXPRESS BACKEND SERVER (Node.js + TSX)                 │
├────────────────────────────────────────────────────────────────────────┤
│  • Auth Routes: /api/auth (Phone login, OTP simulation, user profiles) │
│  • Input Routes: /api/inputs (Catalog, search, filter by woreda/stock) │
│  • Produce Routes: /api/produce (Farmer harvest listings & offers)     │
│  • Market Prices: /api/prices (Regional daily price reports & trends)  │
│  • Orders & Escrow: /api/orders (Create, fund escrow, release, rating) │
│  • Locations: /api/locations (Regions > Zones > Woredas > Kebeles)     │
├────────────────────────────────────────────────────────────────────────┤
│                     PRISMA ORM (Client & Migrations)                   │
└────────────────────────────────────▲───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│              LOCAL SQLITE DATABASE (prisma/farm_link.db)               │
│   Users · Products · ProduceListings · Orders · Payments · Prices       │
└────────────────────────────────────────────────────────────────────────┘
```

### Entity Relationship Diagram (ASCII)

```
┌─────────────────────────┐             ┌─────────────────────────┐
│          USER           │             │        LOCATION         │
├─────────────────────────┤             ├─────────────────────────┤
│ id (PK)                 │             │ id (PK)                 │
│ phone                   │             │ region                  │
│ fullName                │             │ zone                    │
│ role (FARMER|SUPPLIER..)│             │ woreda                  │
│ preferredLanguage       │             │ kebele                  │
│ cooperativeId (FK)      │◄───────┐    │ latitude, longitude     │
│ locationId (FK)         ├────────┼───►└─────────────────────────┘
│ isVerified              │        │
└────────────┬────────────┘        │
             │ 1                   │
             │                     │
             ├─────────────────────┼───────────────────────┐
             │ 1..*                │ 1..*                  │ 1..*
             ▼                     ▼                       ▼
┌─────────────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│      INPUT PRODUCT      │  │  PRODUCE LISTING  │  │   PRICE REPORT    │
├─────────────────────────┤  ├───────────────────┤  ├───────────────────┤
│ id (PK)                 │  │ id (PK)           │  │ id (PK)           │
│ supplierId (FK)         │  │ farmerId (FK)     │  │ commodityName     │
│ category (FERTILIZER..) │  │ commodity (TEFF..)│  │ marketLocation    │
│ title, description      │  │ variety, grade    │  │ region, zone      │
│ priceEtb, unit          │  │ quantityQtl       │  │ minPriceEtb       │
│ stockQuantity           │  │ pricePerQtlEtb    │  │ maxPriceEtb       │
│ isSubsidizedCoop        │  │ locationId (FK)   │  │ avgPriceEtb       │
│ locationId (FK)         │  │ harvestDate       │  │ reportDate        │
└────────────┬────────────┘  └─────────┬─────────┘  └───────────────────┘
             │ 1                       │ 1
             │                         │
             ▼                         ▼
┌─────────────────────────────────────────────────┐
│                     ORDER                       │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ orderType (INPUT_PURCHASE | PRODUCE_PURCHASE)   │
│ buyerId (FK) -> User                            │
│ sellerId (FK) -> User                           │
│ productId (FK, nullable)                        │
│ produceListingId (FK, nullable)                 │
│ quantity, unitPriceEtb, totalEtb                │
│ status (PENDING|CONFIRMED|ESCROW_HELD|DELIVERED)│
│ deliveryAddress, pickupWoreda                   │
│ confirmationOtp                                 │
└────────────────────────────┬────────────────────┘
                             │ 1
                             ▼ 1
┌─────────────────────────────────────────────────┐
│                    PAYMENT                      │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ orderId (FK)                                    │
│ method (TELEBIRR | CBE_BIRR | CHAPA | CASH)     │
│ escrowStatus (HELD | RELEASED | REFUNDED)       │
│ transactionRef, amountEtb                       │
│ createdAt, releasedAt                           │
└─────────────────────────────────────────────────┘
```

### Database Schema (Prisma / SQLite Definition)

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String           @id @default(uuid())
  phone             String           @unique
  fullName          String
  role              String           // "FARMER" | "SUPPLIER" | "BUYER" | "ADMIN"
  language          String           @default("am") // "am" | "om" | "ti" | "en"
  isVerified        Boolean          @default(false)
  nationalIdFayda   String?
  cooperativeName   String?
  region            String           // e.g. "Oromia", "Amhara"
  zone              String           // e.g. "East Shewa"
  woreda            String           // e.g. "Ada'a"
  kebele            String?
  createdAt         DateTime         @default(now())
  
  products          Product[]        // For suppliers
  produceListings   ProduceListing[] // For farmers
  buyerOrders       Order[]          @relation("BuyerOrders")
  sellerOrders      Order[]          @relation("SellerOrders")
}

model Product {
  id               String   @id @default(uuid())
  supplierId       String
  supplier         User     @relation(fields: [supplierId], references: [id])
  category         String   // "FERTILIZER" | "SEED" | "PESTICIDE" | "TOOLS_PPE"
  title            String
  description      String
  brandOrVariety   String
  priceEtb         Float
  unit             String   // "50kg bag", "liter", "piece"
  stockQuantity    Int
  isSubsidizedCoop Boolean  @default(false)
  region           String
  woreda           String
  imageUrl         String?
  model3dKey       String?  // key for procedural 3D model
  createdAt        DateTime @default(now())
  orders           Order[]
}

model ProduceListing {
  id              String   @id @default(uuid())
  farmerId        String
  farmer          User     @relation(fields: [farmerId], references: [id])
  cropOrLivestock String   // "Teff", "Wheat", "Maize", "Coffee", "Onion", "Goat", "Cattle"
  variety         String   // "Magna (White)", "Serena", "Sidama Washed"
  grade           String   // "Grade 1", "Grade 2", "Standard"
  quantity        Float    // e.g. 50
  unit            String   // "Quintal (100kg)", "Kg", "Head"
  pricePerUnitEtb Float
  region          String
  woreda          String
  description     String?
  status          String   @default("AVAILABLE") // "AVAILABLE" | "RESERVED" | "SOLD"
  model3dKey      String?  // key for procedural 3D model
  createdAt       DateTime @default(now())
  orders          Order[]
}

model PriceReport {
  id            String   @id @default(uuid())
  commodity     String
  marketName    String   // e.g. "Addis Ababa Merkato", "Ada'a Bishoftu", "Jimma Town"
  region        String
  unit          String   @default("Quintal")
  minPriceEtb   Float
  maxPriceEtb   Float
  avgPriceEtb   Float
  trend         String   @default("STABLE") // "UP" | "DOWN" | "STABLE"
  reportDate    DateTime @default(now())
}

model Order {
  id               String          @id @default(uuid())
  orderNumber      String          @unique
  buyerId          String
  buyer            User            @relation("BuyerOrders", fields: [buyerId], references: [id])
  sellerId         String
  seller           User            @relation("SellerOrders", fields: [sellerId], references: [id])
  productId        String?
  product          Product?        @relation(fields: [productId], references: [id])
  produceListingId String?
  produceListing   ProduceListing? @relation(fields: [produceListingId], references: [id])
  quantity         Float
  unitPriceEtb     Float
  totalAmountEtb   Float
  status           String          // "PENDING" | "CONFIRMED" | "ESCROW_HELD" | "DELIVERED" | "COMPLETED" | "CANCELLED"
  deliveryMethod   String          // "PICKUP" | "SUPPLIER_DELIVERY" | "COOP_POINT"
  deliveryNotes    String?
  confirmationOtp  String          // 4-digit code provided to buyer to give seller upon delivery
  paymentMethod    String          // "TELEBIRR" | "CBE_BIRR" | "CASH_ON_DELIVERY"
  paymentStatus    String          // "PENDING" | "ESCROW_HELD" | "RELEASED"
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}
```

---

## 5. Phase 1 Implementation Steps

1. **Backend Initialization**:
   - Create Express REST server in `server/index.ts` with API endpoints:
     - `POST /api/auth/login-otp` & `POST /api/auth/verify-otp`
     - `GET /api/users/current` & `POST /api/users/switch-role`
     - `GET /api/inputs` & `POST /api/inputs`
     - `GET /api/produce` & `POST /api/produce`
     - `GET /api/prices` (historical daily trends & regional boards)
     - `POST /api/orders` & `POST /api/orders/:id/escrow-release`
   - Seed database with realistic Ethiopian market data (Bishoftu Teff, Sidama Coffee, Amhara NPS fertilizer, Adama Onion).
2. **Multilingual & PWA Frontend Core**:
   - Multi-language dictionary module supporting `am` (አማርኛ), `om` (Afaan Oromoo), `ti` (ትግርኛ), and `en` (English).
   - Audio prompt synthesizer / simulated voice guidance for low-literacy users.
   - PWA Manifest and Service Worker registration for offline resilience.
3. **Marketplace UI & Role Simulator**:
   - Farmer dashboard: Input store with bulk order inquiry, Produce seller wizard, Market Price tracker.
   - Supplier dashboard: Inventory management, Stock updates, incoming order approval.
   - Buyer dashboard: Crop procurement, price comparison, Telebirr/CBE payment checkout.
4. **Three.js 3D Agricultural Asset Visualizer**:
   - Built with Three.js (r160+ compatible, ACESFilmicToneMapping, RoomEnvironment procedural PBR reflections, and collapsible bottom dock).
   - Interactive models:
     - Teff Sheaf (procedural golden stems with delicate grain panicles)
     - Ethiopian Coffee Branch (polished leaves, ripe crimson cherries)
     - Heavy-duty Agricultural Tractor & Disc Plough assembly.
5. **Testing & Verification**:
   - End-to-end user flows verified: input ordering, produce listing, price lookups, role switching, language swaps, and 3D rendering.
